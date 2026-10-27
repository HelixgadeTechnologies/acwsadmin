export type VendorStatus = 'pending' | 'approved' | 'waitlisted' | 'rejected';
export type PaymentTier = 'standard' | 'premium' | 'catwalk' | 'executive';

export interface Vendor {
  _id: string;
  refCode: string;
  businessName: string;
  category: string;
  contactName?: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  website?: string;
  instagram?: string;
  baseLocation?: string;
  paymentTier: PaymentTier;
  weddingVolume?: string;
  typicalSpend?: string;
  serviceAreas?: string[];
  marketsServed?: string[];
  objectives?: string[];
  discoveryChannels?: string[];
  privacyAcknowledged: boolean;
  marketingConsent: boolean;
  status: VendorStatus;
  notes?: string;
  curatorNotes?: string;
  qrCode?: string;
  publicProfileUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Attendee {
  _id: string;
  refCode: string;
  fullName: string;
  partnerName?: string;
  email: string;
  phone?: string;
  ticketType: 'standard' | 'vip' | 'catwalk-exclusive';
  pricePaid?: number;
  paymentStatus?: 'paid' | 'pending' | 'complimentary';
  weddingDate?: string;
  fastTrackPass?: boolean;
  checkedIn: boolean;
  checkedInAt?: string | null;
  registeredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface KpiStats {
  totalVendors: number;
  approvedCount: number;
  pendingCount: number;
  waitlistedCount: number;
  rejectedCount: number;
  catwalkCount: number;
  premiumCount: number;
  standardCount: number;
  totalAttendees: number;
  attendeesCheckedIn: number;
  totalRevenue: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin' | 'curator';
  token?: string;
}

export interface SystemSettings {
  eventName: string;
  eventDates: string;
  venueName: string;
  venueHall: string;
  quotas: {
    catwalk: number;
    premium: number;
    standard: number;
  };
  registrationOpen: boolean;
  autoSendConfirmation: boolean;
  vatRate: number;
  apiBaseUrl: string;
}
