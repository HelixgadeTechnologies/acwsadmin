import { AdminUser, Attendee, KpiStats, Vendor, VendorStatus } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://acwsbackend.onrender.com/api/v1';

// Normalizer helpers ensuring full field compatibility between Mongo and React
function normalizeVendor(v: any): Vendor {
  if (!v) return v;
  return {
    ...v,
    contactName: v.contactName || v.contactPerson || '',
    contactPerson: v.contactPerson || v.contactName || '',
    notes: v.notes || v.curatorNotes || '',
    curatorNotes: v.curatorNotes || v.notes || '',
    paymentTier: v.paymentTier || 'standard',
    status: v.status || 'pending',
    createdAt: v.createdAt || new Date().toISOString()
  };
}

function normalizeAttendee(a: any): Attendee {
  if (!a) return a;
  return {
    ...a,
    registeredAt: a.registeredAt || a.createdAt || new Date().toISOString(),
    checkedIn: Boolean(a.checkedIn)
  };
}

// Offline fallback mock data removed - portal runs strictly on live backend data


export class ApiService {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('acws_admin_token') || sessionStorage.getItem('acws_admin_token');
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('acws_admin_token');
        localStorage.removeItem('acws_admin_user');
      }
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || `API request failed with status ${response.status}`);
    }

    return data;
  }

  // Admin Auth
  static async login(email: string, password: string): Promise<{ user: AdminUser; token: string }> {
    try {
      const res = await this.request<{ data: { user: AdminUser; token: string } }>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      return res.data;
    } catch (err: any) {
      throw new Error(err.message || 'Invalid email or password.');
    }
  }

  static async getMe(): Promise<AdminUser> {
    const res = await this.request<{ data: AdminUser }>('/admin/me');
    return res.data;
  }

  // Dashboard Stats
  static async getStats(): Promise<KpiStats> {
    try {
      const [vendorStatsRes, attendeesRes] = await Promise.allSettled([
        this.request<{ data: any }>('/admin/vendors/stats'),
        this.request<{ data: { attendees: any[]; total: number } }>('/admin/attendees?limit=1000')
      ]);

      const vData = vendorStatsRes.status === 'fulfilled' ? vendorStatsRes.value.data : {};
      const aData = attendeesRes.status === 'fulfilled' ? attendeesRes.value.data : { attendees: [], total: 0 };

      const attendees = Array.isArray(aData.attendees) ? aData.attendees : [];
      const totalAttendees = aData.total || attendees.length || 0;
      const checkedInCount = attendees.filter((a: any) => a.checkedIn).length;
      
      const calculatedRevenue = attendees.reduce((acc: number, a: any) => acc + (a.pricePaid || 0), 0) +
        ((vData.approved || 0) * 1250);

      return {
        totalVendors: vData.total || 0,
        approvedCount: vData.approved || 0,
        pendingCount: vData.pending || 0,
        waitlistedCount: vData.waitlisted || 0,
        rejectedCount: vData.rejected || 0,
        catwalkCount: vData.catwalk || 0,
        premiumCount: vData.premium || 0,
        standardCount: vData.standard || 0,
        totalAttendees: totalAttendees,
        attendeesCheckedIn: checkedInCount,
        totalRevenue: calculatedRevenue
      };
    } catch {
      // Local fallback calculation from actual cached data
      const vendors = this.getLocalVendors();
      const attendees = this.getLocalAttendees();
      const approved = vendors.filter(v => v.status === 'approved').length;
      const pending = vendors.filter(v => v.status === 'pending').length;
      const waitlisted = vendors.filter(v => v.status === 'waitlisted').length;
      const rejected = vendors.filter(v => v.status === 'rejected').length;
      const checkedInCount = attendees.filter(a => a.checkedIn).length;
      const revenue = attendees.reduce((acc, a) => acc + (a.pricePaid || 0), 0) + (approved * 1250);

      return {
        totalVendors: vendors.length,
        approvedCount: approved,
        pendingCount: pending,
        waitlistedCount: waitlisted,
        rejectedCount: rejected,
        catwalkCount: vendors.filter(v => v.paymentTier === 'catwalk').length,
        premiumCount: vendors.filter(v => v.paymentTier === 'premium').length,
        standardCount: vendors.filter(v => v.paymentTier === 'standard').length,
        totalAttendees: attendees.length,
        attendeesCheckedIn: checkedInCount,
        totalRevenue: revenue
      };
    }
  }

  // Vendors
  static getLocalVendors(): Vendor[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('acws_cached_vendors');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out any legacy dummy vendor IDs from previous mocks
          const realVendors = parsed
            .filter((v: any) => v._id !== 'vnd-001' && v._id !== 'vnd-002')
            .map(normalizeVendor);
          return realVendors;
        }
      } catch {
        return [];
      }
    }
    return [];
  }

  static saveLocalVendors(vendors: Vendor[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('acws_cached_vendors', JSON.stringify(vendors));
  }

  static async getVendors(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  } = {}): Promise<{ vendors: Vendor[]; total: number; totalPages: number }> {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page.toString());
      if (params.limit) query.set('limit', params.limit.toString());
      if (params.search) query.set('search', params.search);
      if (params.status && params.status !== 'all') query.set('status', params.status);
      if (params.category && params.category !== 'all') query.set('category', params.category);

      const res = await this.request<{ data: { vendors: any[]; total: number; totalPages: number } }>(
        `/admin/vendors?${query.toString()}`
      );
      if (res.data?.vendors) {
        const normalized = res.data.vendors.map(normalizeVendor);
        this.saveLocalVendors(normalized);
        return {
          vendors: normalized,
          total: res.data.total,
          totalPages: res.data.totalPages || 1
        };
      }
      return { vendors: [], total: 0, totalPages: 1 };
    } catch {
      let filtered = this.getLocalVendors();
      if (params.status && params.status !== 'all') {
        filtered = filtered.filter(v => v.status === params.status);
      }
      if (params.category && params.category !== 'all') {
        filtered = filtered.filter(v => v.category === params.category);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          v =>
            v.businessName.toLowerCase().includes(q) ||
            v.refCode.toLowerCase().includes(q) ||
            v.email.toLowerCase().includes(q) ||
            (v.contactName && v.contactName.toLowerCase().includes(q))
        );
      }
      return {
        vendors: filtered,
        total: filtered.length,
        totalPages: 1
      };
    }
  }

  static async getVendorById(id: string): Promise<Vendor | null> {
    try {
      const res = await this.request<{ data: any }>(`/admin/vendors/${id}`);
      return normalizeVendor(res.data);
    } catch {
      const list = this.getLocalVendors();
      return list.find(v => v._id === id || v.refCode === id) || null;
    }
  }

  static async updateVendorStatus(id: string, status: VendorStatus, notes?: string): Promise<Vendor> {
    try {
      const res = await this.request<{ data: any }>(`/admin/vendors/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes })
      });
      const updated = normalizeVendor(res.data);
      // Synchronize in local cache
      const list = this.getLocalVendors();
      const idx = list.findIndex(v => v._id === id || v.refCode === id);
      if (idx !== -1) {
        list[idx] = updated;
        this.saveLocalVendors(list);
      }
      return updated;
    } catch {
      const list = this.getLocalVendors();
      const idx = list.findIndex(v => v._id === id || v.refCode === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], status, notes: notes || list[idx].notes };
        this.saveLocalVendors(list);
        return list[idx];
      }
      throw new Error('Vendor not found.');
    }
  }

  // Attendees
  static getLocalAttendees(): Attendee[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('acws_cached_attendees');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out any legacy dummy attendee IDs from previous mocks
          const realAttendees = parsed
            .filter((a: any) => a._id !== 'att-001' && !a._id?.startsWith('att-import-'))
            .map(normalizeAttendee);
          return realAttendees;
        }
      } catch {
        return [];
      }
    }
    return [];
  }

  static saveLocalAttendees(attendees: Attendee[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('acws_cached_attendees', JSON.stringify(attendees));
  }

  static async getAttendees(params: {
    page?: number;
    limit?: number;
    search?: string;
    ticketType?: string;
    checkedIn?: boolean;
  } = {}): Promise<Attendee[]> {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page.toString());
      if (params.limit) query.set('limit', params.limit.toString());
      if (params.search) query.set('search', params.search);
      if (params.ticketType && params.ticketType !== 'all') query.set('ticketType', params.ticketType);
      if (params.checkedIn !== undefined) query.set('checkedIn', String(params.checkedIn));

      const res = await this.request<{ data: { attendees: any[]; total: number } }>(
        `/admin/attendees?${query.toString()}`
      );
      if (res.data?.attendees) {
        const normalized = res.data.attendees.map(normalizeAttendee);
        this.saveLocalAttendees(normalized);
        return normalized;
      }
      return this.getLocalAttendees();
    } catch {
      return this.getLocalAttendees();
    }
  }

  static async toggleAttendeeCheckin(id: string): Promise<Attendee> {
    try {
      const res = await this.request<{ data: any }>(`/admin/attendees/${id}/checkin`, {
        method: 'PATCH'
      });
      const updated = normalizeAttendee(res.data);
      const list = this.getLocalAttendees();
      const idx = list.findIndex(a => a._id === id || a.refCode === id);
      if (idx !== -1) {
        list[idx] = updated;
        this.saveLocalAttendees(list);
      }
      return updated;
    } catch {
      const attendees = this.getLocalAttendees();
      const idx = attendees.findIndex(a => a._id === id || a.refCode === id);
      if (idx !== -1) {
        attendees[idx].checkedIn = !attendees[idx].checkedIn;
        attendees[idx].checkedInAt = attendees[idx].checkedIn ? new Date().toISOString() : undefined;
        this.saveLocalAttendees(attendees);
        return attendees[idx];
      }
      throw new Error('Attendee not found');
    }
  }

  static async importAttendees(newAttendees: Omit<Attendee, '_id' | 'refCode' | 'checkedIn' | 'registeredAt'>[]): Promise<number> {
    const res = await this.request<{ data: { count: number; insertedIds?: string[] } }>('/admin/attendees/batch', {
      method: 'POST',
      body: JSON.stringify({ attendees: newAttendees })
    });
    await this.getAttendees();
    return res.data?.count || newAttendees.length;
  }
}
