import { axiosClient } from './axiosClient';

export interface Amenity {
  id: string;
  categoryCode: string;
  name: string;
  description?: string;
  location?: string;
  capacity: number;
  hourlyRate: number;
  dailyRate: number;
  securityDeposit: number;
  cancellationFee: number;
  openTime: string;
  closeTime: string;
  requiresApproval: boolean;
  maxBookingHours: number;
  maxAdvanceBookDays: number;
  amenityRules?: string;
  isActive: boolean;
  _count?: { bookings: number };
}

export interface AmenityBooking {
  id: string;
  bookingNumber: string;
  bookingType: string;
  status: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  guestCount: number;
  purposeNotes?: string;
  bookingCharge: number;
  securityDeposit: number;
  totalAmount: number;
  paidAmount: number;
  refundAmount: number;
  qrToken?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  amenity?: { name: string; categoryCode: string; location?: string };
  person?: { firstName: string; lastName: string; phone: string };
}

export interface BookingMetrics {
  totalAmenities: number;
  totalBookings: number;
  pendingApproval: number;
  confirmedBookings: number;
  thisMonthBookings: number;
  totalRevenue: number;
}

export interface CalendarResponse {
  month: string;
  calendar: Record<string, AmenityBooking[]>;
}

export const amenityBookingApi = {
  getMetrics: async (): Promise<BookingMetrics> => {
    const res = await axiosClient.get('/amenity-booking/metrics');
    return res.data?.data || res.data;
  },

  getAmenities: async (categoryCode?: string): Promise<Amenity[]> => {
    const res = await axiosClient.get('/amenity-booking/amenities', {
      params: categoryCode ? { categoryCode } : {},
    });
    return res.data?.data || res.data || [];
  },

  createAmenity: async (data: Partial<Amenity>): Promise<Amenity> => {
    const res = await axiosClient.post('/amenity-booking/amenities', data);
    return res.data?.data || res.data;
  },

  getCalendar: async (month: string): Promise<CalendarResponse> => {
    const res = await axiosClient.get('/amenity-booking/calendar', { params: { month } });
    return res.data?.data || res.data;
  },

  getBookings: async (params?: {
    search?: string;
    amenityId?: string;
    status?: string;
    bookingDate?: string;
    month?: string;
  }) => {
    const res = await axiosClient.get('/amenity-booking', { params });
    return res.data?.data || res.data;
  },

  createBooking: async (data: {
    amenityId: string;
    personId: string;
    bookingType?: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    guestCount?: number;
    purposeNotes?: string;
    paymentMethod?: string;
  }): Promise<AmenityBooking> => {
    const res = await axiosClient.post('/amenity-booking', data);
    return res.data?.data || res.data;
  },

  updateBooking: async (
    id: string,
    data: {
      status?: string;
      rejectionReason?: string;
      cancellationNote?: string;
      damageCharges?: number;
    },
  ): Promise<AmenityBooking> => {
    const res = await axiosClient.put(`/amenity-booking/${id}`, data);
    return res.data?.data || res.data;
  },
};
