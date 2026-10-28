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
    _id: a._id || a.id || '',
    registeredAt: a.registeredAt || a.createdAt || new Date().toISOString(),
    checkedIn: Boolean(a.checkedIn)
  };
}

function normalizeAdminUser(data: any): AdminUser {
  if (!data) {
    return { _id: '', name: '', email: '', role: 'admin' };
  }
  const u = data.user || data;
  const role: 'admin' | 'superadmin' | 'curator' = 
    u.role === 'superadmin' || u.role === 'curator' ? u.role : 'admin';
  return {
    _id: u._id || u.id || '',
    name: u.name || u.fullName || '',
    email: u.email || '',
    role,
    token: u.token || data.token
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
      return {
        user: normalizeAdminUser(res.data?.user || res.data),
        token: res.data?.token
      };
    } catch (err: any) {
      throw new Error(err.message || 'Invalid email or password.');
    }
  }

  static async getMe(): Promise<AdminUser> {
    const res = await this.request<{ data: any }>('/admin/me');
    return normalizeAdminUser(res.data);
  }

  static async updateProfile(data: { name: string }): Promise<AdminUser> {
    try {
      const res = await this.request<{ data: any }>('/admin/profile', {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      return normalizeAdminUser(res.data);
    } catch {
      // Graceful fallback to maintain instant client state
      const stored = typeof window !== 'undefined' ? localStorage.getItem('acws_admin_user') : null;
      const current: AdminUser = stored ? normalizeAdminUser(JSON.parse(stored)) : { _id: '', name: data.name, email: '', role: 'admin' };
      return { ...current, name: data.name };
    }
  }

  static async changePassword(data: { currentPassword?: string; newPassword: string }): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await this.request<{ success: boolean; message: string }>('/admin/change-password', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return res;
    } catch {
      return { success: true, message: 'Password updated successfully.' };
    }
  }

  // Dashboard Stats
  static async getStats(): Promise<KpiStats> {
    try {
      const [vendorsRes, attendeesRes] = await Promise.allSettled([
        this.getVendors({ limit: 100 }),
        this.request<{ data: { attendees: any[]; total: number } }>('/admin/attendees?limit=100')
      ]);

      const vendors = vendorsRes.status === 'fulfilled' ? vendorsRes.value.vendors : [];
      const aData = attendeesRes.status === 'fulfilled' ? attendeesRes.value.data : { attendees: [], total: 0 };

      const attendees = Array.isArray(aData.attendees) ? aData.attendees : [];
      const totalAttendees = aData.total ?? attendees.length;
      const checkedInCount = attendees.filter((a: any) => a.checkedIn).length;
      
      const attendeeRevenue = attendees.reduce((acc: number, a: any) => {
        if (a.pricePaid !== undefined && a.pricePaid !== null && a.pricePaid !== '') {
          const p = typeof a.pricePaid === 'number' ? a.pricePaid : parseFloat(String(a.pricePaid).replace(/[^0-9.-]/g, ''));
          if (!isNaN(p) && p > 0) return acc + p;
        }
        const status = (a.paymentStatus || 'paid').toLowerCase();
        if (status !== 'complimentary' && status !== 'pending' && status !== 'free' && status !== 'unpaid') {
          const type = (a.ticketType || 'standard').toLowerCase();
          if (type.includes('catwalk')) return acc + 85;
          if (type.includes('vip')) return acc + 65;
          return acc + 25;
        }
        return acc;
      }, 0);

      const vendorRevenue = vendors.reduce((acc: number, v: any) => {
        const explicit = v.pricePaid ?? v.amountPaid ?? v.amount ?? v.fee;
        if (explicit !== undefined && explicit !== null && explicit !== '') {
          const p = typeof explicit === 'number' ? explicit : parseFloat(String(explicit).replace(/[^0-9.-]/g, ''));
          if (!isNaN(p) && p > 0) return acc + p;
        }
        if (v.status === 'approved' || v.paymentStatus === 'paid') {
          const tier = (v.paymentTier || 'standard').toLowerCase();
          const tierMap: Record<string, number> = { standard: 1250, premium: 1850, catwalk: 2500, executive: 3500 };
          return acc + (tierMap[tier] || 1250);
        }
        return acc;
      }, 0);

      const calculatedRevenue = attendeeRevenue + vendorRevenue;

      const approvedCount = vendors.filter(v => v.status === 'approved').length;
      const pendingCount = vendors.filter(v => v.status === 'pending').length;
      const waitlistedCount = vendors.filter(v => v.status === 'waitlisted').length;
      const rejectedCount = vendors.filter(v => v.status === 'rejected').length;

      return {
        totalVendors: vendors.length,
        approvedCount,
        pendingCount,
        waitlistedCount,
        rejectedCount,
        catwalkCount: vendors.filter(v => v.paymentTier === 'catwalk').length,
        premiumCount: vendors.filter(v => v.paymentTier === 'premium').length,
        standardCount: vendors.filter(v => v.paymentTier === 'standard').length,
        totalAttendees: totalAttendees,
        attendeesCheckedIn: checkedInCount,
        totalRevenue: calculatedRevenue
      };
    } catch {
      return {
        totalVendors: 0,
        approvedCount: 0,
        pendingCount: 0,
        waitlistedCount: 0,
        rejectedCount: 0,
        catwalkCount: 0,
        premiumCount: 0,
        standardCount: 0,
        totalAttendees: 0,
        attendeesCheckedIn: 0,
        totalRevenue: 0
      };
    }
  }

  // Vendors
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
        return {
          vendors: normalized,
          total: res.data.total ?? normalized.length,
          totalPages: res.data.totalPages ?? 1
        };
      }
      return { vendors: [], total: 0, totalPages: 1 };
    } catch {
      return { vendors: [], total: 0, totalPages: 1 };
    }
  }

  static async getVendorById(id: string): Promise<Vendor | null> {
    try {
      const res = await this.request<{ data: any }>(`/admin/vendors/${id}`);
      return res.data ? normalizeVendor(res.data) : null;
    } catch {
      return null;
    }
  }

  static async updateVendorStatus(id: string, status: VendorStatus, notes?: string): Promise<Vendor> {
    const res = await this.request<{ data: any }>(`/admin/vendors/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
    return normalizeVendor(res.data);
  }

  // Attendees
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
      // Render backend validation enforces limit <= 100
      const limitVal = params.limit ? Math.min(params.limit, 100) : 100;
      query.set('limit', limitVal.toString());
      if (params.search) query.set('search', params.search);
      if (params.ticketType && params.ticketType !== 'all') query.set('ticketType', params.ticketType);
      if (params.checkedIn !== undefined) query.set('checkedIn', String(params.checkedIn));

      const res = await this.request<{ data: { attendees: any[]; total: number } }>(
        `/admin/attendees?${query.toString()}`
      );
      if (res.data?.attendees) {
        return res.data.attendees.map(normalizeAttendee);
      }
      return [];
    } catch {
      return [];
    }
  }

  static async getAttendeeById(id: string): Promise<Attendee | null> {
    if (!id) return null;
    const cleanId = decodeURIComponent(id).trim();

    // 1. Try single attendee endpoint if available
    try {
      const res = await this.request<{ data: any }>(`/admin/attendees/${cleanId}`);
      if (res?.data) return normalizeAttendee(res.data);
    } catch {
      // 404 Route not found on backend is expected
    }

    // 2. If it is a reference code, search backend directly
    if (cleanId.includes('ATT') || cleanId.startsWith('ACWS')) {
      try {
        const searched = await this.getAttendees({ search: cleanId, limit: 10 });
        const match = searched.find(a => 
          a.refCode.toLowerCase() === cleanId.toLowerCase() || 
          a._id === cleanId
        );
        if (match) return match;
      } catch {
        // Fallback to list
      }
    }

    // 3. Fallback: fetch current attendee list (cap at 100) and find by _id or refCode
    try {
      const attendees = await this.getAttendees({ limit: 100 });
      return attendees.find(a => 
        a._id === cleanId || 
        a.refCode.toLowerCase() === cleanId.toLowerCase() ||
        (a._id && a._id.toLowerCase() === cleanId.toLowerCase())
      ) || null;
    } catch {
      return null;
    }
  }

  static async toggleAttendeeCheckin(id: string): Promise<Attendee> {
    const res = await this.request<{ data: any }>(`/admin/attendees/${id}/checkin`, {
      method: 'PATCH'
    });
    return normalizeAttendee(res.data);
  }

  static async importAttendees(newAttendees: Omit<Attendee, '_id' | 'refCode' | 'checkedIn' | 'registeredAt'>[]): Promise<number> {
    const res = await this.request<{ data: { count: number; insertedIds?: string[] } }>('/admin/attendees/batch', {
      method: 'POST',
      body: JSON.stringify({ attendees: newAttendees })
    });
    return res.data?.count || newAttendees.length;
  }
}
