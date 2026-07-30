import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import {
  amenityBookingApi,
  Amenity,
  AmenityBooking,
  BookingMetrics,
  CalendarResponse,
} from '../api/amenity-booking.api';
import {
  CalendarDays,
  Plus,
  Search,
  Building2,
  Users,
  Clock,
  CheckCircle,
  X,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  QrCode,
  Layers,
  LogIn,
  LogOut,
  Ban,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { code: 'CLUB_HOUSE', label: 'Club House', emoji: '🏛️' },
  { code: 'COMMUNITY_HALL', label: 'Community Hall', emoji: '🏟️' },
  { code: 'PARTY_HALL', label: 'Party Hall', emoji: '🎉' },
  { code: 'SWIMMING_POOL', label: 'Swimming Pool', emoji: '🏊' },
  { code: 'GYM', label: 'Gym', emoji: '💪' },
  { code: 'INDOOR_GAMES', label: 'Indoor Games', emoji: '🎮' },
  { code: 'TENNIS_COURT', label: 'Tennis Court', emoji: '🎾' },
  { code: 'BADMINTON_COURT', label: 'Badminton Court', emoji: '🏸' },
  { code: 'BASKETBALL_COURT', label: 'Basketball Court', emoji: '🏀' },
  { code: 'CONFERENCE_ROOM', label: 'Conference Room', emoji: '💼' },
  { code: 'GUEST_HOUSE', label: 'Guest House', emoji: '🏠' },
  { code: 'BBQ_AREA', label: 'BBQ Area', emoji: '🔥' },
  { code: 'CHILDREN_PLAY_AREA', label: 'Children Play Area', emoji: '🛝' },
  { code: 'EV_CHARGING_SLOT', label: 'EV Charging Slot', emoji: '⚡' },
  { code: 'MEETING_ROOM', label: 'Meeting Room', emoji: '📋' },
  { code: 'OUTDOOR_COURT', label: 'Outdoor Court', emoji: '🏟️' },
];

const statusColor = (s: string) => {
  switch (s) {
    case 'APPROVED': return 'success';
    case 'CHECKED_IN': return 'success';
    case 'COMPLETED': return 'secondary';
    case 'PENDING_APPROVAL': return 'warning';
    case 'CANCELLED': return 'destructive';
    case 'REJECTED': return 'destructive';
    case 'WAITLISTED': return 'outline';
    default: return 'outline';
  }
};

const nowMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const AmenityBookingPage: React.FC = () => {
  const [tab, setTab] = useState<'bookings' | 'amenities' | 'calendar'>('bookings');
  const [bookings, setBookings] = useState<AmenityBooking[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [metrics, setMetrics] = useState<BookingMetrics | null>(null);
  const [calendar, setCalendar] = useState<CalendarResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [calMonth, setCalMonth] = useState(nowMonth());

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<AmenityBooking | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'CANCEL' | 'CHECK_IN' | 'CHECK_OUT' | null>(null);

  // New booking form
  const [selAmenityId, setSelAmenityId] = useState('');
  const [selPersonId, setSelPersonId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [guestCount, setGuestCount] = useState(1);
  const [purposeNotes, setPurposeNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // New amenity form
  const [amenityCategory, setAmenityCategory] = useState('CLUB_HOUSE');
  const [amenityName, setAmenityName] = useState('');
  const [amenityLocation, setAmenityLocation] = useState('');
  const [amenityCapacity, setAmenityCapacity] = useState(10);
  const [amenityHourlyRate, setAmenityHourlyRate] = useState(0);
  const [amenitySecurityDeposit, setAmenitySecurityDeposit] = useState(0);
  const [amenityRequiresApproval, setAmenityRequiresApproval] = useState(false);
  const [amenityOpenTime, setAmenityOpenTime] = useState('06:00');
  const [amenityCloseTime, setAmenityCloseTime] = useState('22:00');

  // Action modal inputs
  const [actionNote, setActionNote] = useState('');
  const [damageCharges, setDamageCharges] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bRes, mRes, aRes, cRes] = await Promise.all([
        amenityBookingApi.getBookings({
          search: search || undefined,
          status: statusFilter || undefined,
        }),
        amenityBookingApi.getMetrics(),
        amenityBookingApi.getAmenities(),
        amenityBookingApi.getCalendar(calMonth),
      ]);
      setBookings(bRes.data || []);
      setMetrics(mRes);
      setAmenities(Array.isArray(aRes) ? aRes : []);
      setCalendar(cRes);
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, calMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selAmenityId || !bookingDate || !selPersonId) return alert('Select amenity, date, and person');
    try {
      const result = await amenityBookingApi.createBooking({
        amenityId: selAmenityId,
        personId: selPersonId,
        bookingDate,
        startTime,
        endTime,
        guestCount,
        purposeNotes,
        paymentMethod,
      });
      if ((result as any).waitlisted) {
        alert(`⏳ Slot unavailable. Added to waitlist at position #${(result as any).position}`);
      } else {
        alert(`✅ Booking ${(result as any).bookingNumber} created!`);
      }
      setIsBookingModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  const handleCreateAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await amenityBookingApi.createAmenity({
        categoryCode: amenityCategory,
        name: amenityName,
        location: amenityLocation,
        capacity: amenityCapacity,
        hourlyRate: amenityHourlyRate,
        securityDeposit: amenitySecurityDeposit,
        requiresApproval: amenityRequiresApproval,
        openTime: amenityOpenTime,
        closeTime: amenityCloseTime,
      });
      setIsAmenityModalOpen(false);
      setAmenityName('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create amenity');
    }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !actionType) return;
    try {
      const statusMap: Record<string, string> = {
        APPROVE: 'APPROVED',
        REJECT: 'REJECTED',
        CANCEL: 'CANCELLED',
        CHECK_IN: 'CHECKED_IN',
        CHECK_OUT: 'CHECKED_OUT',
      };
      await amenityBookingApi.updateBooking(selectedBooking.id, {
        status: statusMap[actionType],
        rejectionReason: actionType === 'REJECT' ? actionNote : undefined,
        cancellationNote: actionType === 'CANCEL' ? actionNote : undefined,
        damageCharges: actionType === 'CHECK_OUT' ? damageCharges : undefined,
      });
      setSelectedBooking(null);
      setActionType(null);
      setActionNote('');
      setDamageCharges(0);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  // Calendar navigation
  const prevMonth = () => {
    const [y, m] = calMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setCalMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const nextMonth = () => {
    const [y, m] = calMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    setCalMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  // Build calendar grid dates
  const buildCalendarDays = () => {
    const [year, mon] = calMonth.split('-').map(Number);
    const first = new Date(year, mon - 1, 1);
    const last = new Date(year, mon, 0);
    const days: { date: string; bookings: AmenityBooking[] }[] = [];
    for (let d = 1; d <= last.getDate(); d++) {
      const dateStr = `${year}-${String(mon).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, bookings: calendar?.calendar[dateStr] || [] });
    }
    // Pad leading empty days for first day of week
    const leadingBlanks = first.getDay(); // 0=Sun
    return { days, leadingBlanks };
  };

  const bookingColumns = [
    {
      header: 'Booking No. & Facility',
      accessorKey: (row: AmenityBooking) => (
        <div>
          <p className="font-bold font-mono text-xs">{row.bookingNumber}</p>
          <p className="text-[11px] font-semibold text-foreground">{row.amenity?.name}</p>
          <p className="text-[10px] text-muted-foreground">{row.amenity?.location}</p>
        </div>
      ),
    },
    {
      header: 'Date & Time Slot',
      accessorKey: (row: AmenityBooking) => (
        <div className="text-xs font-mono">
          <p className="font-semibold">{new Date(row.bookingDate).toLocaleDateString()}</p>
          <p className="text-muted-foreground text-[10px]">{row.startTime} – {row.endTime} ({row.durationHours}h)</p>
        </div>
      ),
    },
    {
      header: 'Resident',
      accessorKey: (row: AmenityBooking) => (
        <div className="text-xs">
          <p className="font-semibold">{row.person ? `${row.person.firstName} ${row.person.lastName}` : '—'}</p>
          <p className="text-muted-foreground text-[10px]">{row.guestCount} guests</p>
        </div>
      ),
    },
    {
      header: 'Charges',
      accessorKey: (row: AmenityBooking) => (
        <div className="text-xs font-mono">
          <p className="font-bold">₹{Number(row.totalAmount).toLocaleString()}</p>
          {Number(row.securityDeposit) > 0 && (
            <p className="text-[10px] text-muted-foreground">Deposit: ₹{Number(row.securityDeposit).toLocaleString()}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: (row: AmenityBooking) => (
        <Badge variant={statusColor(row.status) as any} className="text-[10px]">{row.status.replace('_', ' ')}</Badge>
      ),
    },
    {
      header: 'Actions',
      accessorKey: (row: AmenityBooking) => (
        <div className="flex gap-1 flex-wrap">
          {row.status === 'PENDING_APPROVAL' && (
            <>
              <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] rounded-lg text-green-600" onClick={() => { setSelectedBooking(row); setActionType('APPROVE'); }}>
                <CheckCircle className="h-3 w-3 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] rounded-lg text-red-500" onClick={() => { setSelectedBooking(row); setActionType('REJECT'); }}>
                <Ban className="h-3 w-3 mr-1" /> Reject
              </Button>
            </>
          )}
          {row.status === 'APPROVED' && (
            <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] rounded-lg text-blue-500" onClick={() => { setSelectedBooking(row); setActionType('CHECK_IN'); }}>
              <LogIn className="h-3 w-3 mr-1" /> Check-In
            </Button>
          )}
          {row.status === 'CHECKED_IN' && (
            <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] rounded-lg text-purple-500" onClick={() => { setSelectedBooking(row); setActionType('CHECK_OUT'); }}>
              <LogOut className="h-3 w-3 mr-1" /> Check-Out
            </Button>
          )}
          {(row.status === 'APPROVED' || row.status === 'PENDING_APPROVAL') && (
            <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] rounded-lg text-red-400" onClick={() => { setSelectedBooking(row); setActionType('CANCEL'); }}>
              <X className="h-3 w-3 mr-1" /> Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  const { days, leadingBlanks } = buildCalendarDays();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-border/40 bg-gradient-to-r from-card via-accent/30 to-background flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" /> Amenity Booking & Facility Reservation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Club House · Pool · Gym · Courts · AMB-00001 Auto-Number · Slot Conflict Detection · QR Entry Pass · Waitlist
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl text-xs" onClick={() => setIsAmenityModalOpen(true)}>
            <Layers className="h-3.5 w-3.5 mr-1.5" /> Add Amenity
          </Button>
          <Button className="rounded-xl text-xs" onClick={() => setIsBookingModalOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> New Booking
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard title="Total Amenities" value={metrics?.totalAmenities || 0} description="Active facilities" icon={Building2} />
        <StatCard title="Total Bookings" value={metrics?.totalBookings || 0} description="All time" icon={CalendarDays} />
        <StatCard title="Pending Approval" value={metrics?.pendingApproval || 0} description="Awaiting review" icon={Clock} />
        <StatCard title="Confirmed" value={metrics?.confirmedBookings || 0} description="Approved & active" icon={CheckCircle} />
        <StatCard title="This Month" value={metrics?.thisMonthBookings || 0} description="Current month bookings" icon={Users} />
        <StatCard title="Revenue" value={`₹${(metrics?.totalRevenue || 0).toLocaleString()}`} description="Facility revenue" icon={DollarSign} />
      </div>

      {/* Tab Nav */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/40 w-fit">
        {(['bookings', 'amenities', 'calendar'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'bookings' && '📋 '}{t === 'amenities' && '🏛️ '}{t === 'calendar' && '📅 '}{t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* TAB: BOOKINGS */}
      {tab === 'bookings' && (
        <>
          <div className="p-4 rounded-xl border border-border/40 bg-card flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by booking no., amenity, or resident..." className="pl-9 h-10 rounded-xl text-xs" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs w-full sm:w-44">
              <option value="">All Statuses</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="WAITLISTED">Waitlisted</option>
            </select>
          </div>
          {isLoading ? (
            <LoadingSpinner message="Loading facility bookings..." />
          ) : (
            <DataTable columns={bookingColumns} data={bookings} emptyMessage="No bookings found." />
          )}
        </>
      )}

      {/* TAB: AMENITIES */}
      {tab === 'amenities' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {amenities.map((a) => {
            const cat = CATEGORY_OPTIONS.find((c) => c.code === a.categoryCode);
            return (
              <div key={a.id} className="p-5 rounded-2xl border border-border/40 bg-card hover:border-primary/30 transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl">{cat?.emoji || '🏛️'}</p>
                    <h3 className="font-bold text-sm mt-1">{a.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{cat?.label || a.categoryCode}</p>
                  </div>
                  <Badge variant={a.isActive ? 'success' : 'outline'} className="text-[10px]">
                    {a.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded-lg bg-background/60 border border-border/30">
                    <p className="text-muted-foreground">Capacity</p>
                    <p className="font-bold text-xs">{a.capacity} persons</p>
                  </div>
                  <div className="p-2 rounded-lg bg-background/60 border border-border/30">
                    <p className="text-muted-foreground">Hourly Rate</p>
                    <p className="font-bold text-xs">₹{Number(a.hourlyRate).toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-background/60 border border-border/30">
                    <p className="text-muted-foreground">Hours</p>
                    <p className="font-bold text-xs">{a.openTime} – {a.closeTime}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-background/60 border border-border/30">
                    <p className="text-muted-foreground">Total Bookings</p>
                    <p className="font-bold text-xs">{a._count?.bookings || 0}</p>
                  </div>
                </div>
                {a.requiresApproval && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-500">
                    <AlertCircle className="h-3 w-3" /> Approval required
                  </div>
                )}
                {a.location && <p className="text-[10px] text-muted-foreground truncate">📍 {a.location}</p>}
              </div>
            );
          })}
          {amenities.length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground text-sm">
              No amenities configured. Click "Add Amenity" to get started.
            </div>
          )}
        </div>
      )}

      {/* TAB: CALENDAR */}
      {tab === 'calendar' && (
        <div className="p-5 rounded-2xl border border-border/40 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold font-display text-lg">
              {new Date(calMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {days.map(({ date, bookings: dayBookings }) => {
              const dayNum = parseInt(date.split('-')[2]);
              const isToday = date === new Date().toISOString().split('T')[0];
              return (
                <div
                  key={date}
                  className={`min-h-[72px] p-1.5 rounded-xl border transition-all ${
                    isToday
                      ? 'border-primary bg-primary/5'
                      : 'border-border/30 bg-background/40 hover:border-primary/30'
                  }`}
                >
                  <p className={`text-[11px] font-bold mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {dayNum}
                  </p>
                  <div className="space-y-0.5">
                    {dayBookings.slice(0, 2).map((b) => (
                      <div
                        key={b.id}
                        className="text-[8px] leading-tight truncate px-1 py-0.5 rounded bg-primary/20 text-primary font-medium"
                      >
                        {b.startTime} {b.amenity?.name}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <p className="text-[8px] text-muted-foreground px-1">+{dayBookings.length - 2} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODAL: New Booking ── */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold font-display">New Facility Booking</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsBookingModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Select Facility *</label>
                <select value={selAmenityId} onChange={(e) => setSelAmenityId(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs" required>
                  <option value="">Choose amenity...</option>
                  {amenities.map((a) => {
                    const cat = CATEGORY_OPTIONS.find((c) => c.code === a.categoryCode);
                    return <option key={a.id} value={a.id}>{cat?.emoji} {a.name} (Cap: {a.capacity})</option>;
                  })}
                </select>
              </div>

              {selAmenityId && (() => {
                const a = amenities.find((x) => x.id === selAmenityId);
                return a ? (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-[10px] font-mono space-y-1">
                    <p className="font-bold text-primary">{a.name}</p>
                    <p>Hours: {a.openTime}–{a.closeTime} · Rate: ₹{a.hourlyRate}/hr · Deposit: ₹{a.securityDeposit}</p>
                    {a.requiresApproval && <p className="text-amber-500">⚠ Requires committee approval</p>}
                  </div>
                ) : null;
              })()}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Booking Date *</label>
                <Input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Start Time</label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">End Time</label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Guest Count</label>
                  <Input type="number" value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} min={1} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs">
                    <option value="UPI">UPI</option>
                    <option value="RAZORPAY">Razorpay</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Purpose / Notes</label>
                <textarea value={purposeNotes} onChange={(e) => setPurposeNotes(e.target.value)} placeholder="Birthday party, yoga session, business meeting..." className="w-full h-16 p-3 rounded-xl border border-input bg-background/50 text-xs resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsBookingModalOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl text-xs">
                  <QrCode className="h-3.5 w-3.5 mr-1.5" /> Confirm Booking
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Add Amenity ── */}
      {isAmenityModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold font-display">Add New Facility / Amenity</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsAmenityModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateAmenity} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Facility Category *</label>
                <select value={amenityCategory} onChange={(e) => setAmenityCategory(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs" required>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Facility Name *</label>
                <Input value={amenityName} onChange={(e) => setAmenityName(e.target.value)} placeholder="e.g. Tower A Club House, Rooftop Party Terrace" required />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Location</label>
                <Input value={amenityLocation} onChange={(e) => setAmenityLocation(e.target.value)} placeholder="Ground Floor, Podium Level 2..." />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Capacity</label>
                  <Input type="number" value={amenityCapacity} onChange={(e) => setAmenityCapacity(Number(e.target.value))} min={1} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Hourly Rate (₹)</label>
                  <Input type="number" value={amenityHourlyRate} onChange={(e) => setAmenityHourlyRate(Number(e.target.value))} min={0} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Deposit (₹)</label>
                  <Input type="number" value={amenitySecurityDeposit} onChange={(e) => setAmenitySecurityDeposit(Number(e.target.value))} min={0} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Opens At</label>
                  <Input type="time" value={amenityOpenTime} onChange={(e) => setAmenityOpenTime(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Closes At</label>
                  <Input type="time" value={amenityCloseTime} onChange={(e) => setAmenityCloseTime(e.target.value)} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={amenityRequiresApproval} onChange={(e) => setAmenityRequiresApproval(e.target.checked)} className="rounded" />
                <span className="font-semibold">Requires Committee Approval before confirmation</span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsAmenityModalOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl text-xs">
                  <Layers className="h-3.5 w-3.5 mr-1.5" /> Create Amenity
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Action (Approve/Reject/Cancel/Check-In/Out) ── */}
      {selectedBooking && actionType && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold font-display">
                {actionType === 'APPROVE' && '✅ Approve Booking'}
                {actionType === 'REJECT' && '❌ Reject Booking'}
                {actionType === 'CANCEL' && '🚫 Cancel Booking'}
                {actionType === 'CHECK_IN' && '🟢 Check-In'}
                {actionType === 'CHECK_OUT' && '🔴 Check-Out'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => { setSelectedBooking(null); setActionType(null); }} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleAction} className="space-y-4">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs font-mono space-y-1">
                <p className="font-bold">{selectedBooking.bookingNumber}</p>
                <p>{selectedBooking.amenity?.name} · {new Date(selectedBooking.bookingDate).toLocaleDateString()}</p>
                <p>{selectedBooking.startTime} – {selectedBooking.endTime}</p>
              </div>

              {(actionType === 'REJECT' || actionType === 'CANCEL') && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    {actionType === 'REJECT' ? 'Rejection Reason' : 'Cancellation Note'}
                  </label>
                  <textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)} className="w-full h-16 p-3 rounded-xl border border-input bg-background/50 text-xs resize-none" placeholder="Optional note..." />
                </div>
              )}

              {actionType === 'CHECK_OUT' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Damage Charges (₹)</label>
                  <Input type="number" value={damageCharges} onChange={(e) => setDamageCharges(Number(e.target.value))} min={0} placeholder="0 if no damage" />
                  <p className="text-[10px] text-muted-foreground">Security deposit ₹{Number(selectedBooking.securityDeposit).toLocaleString()} on hold</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => { setSelectedBooking(null); setActionType(null); }} className="rounded-xl text-xs">Cancel</Button>
                <Button type="submit" className="rounded-xl text-xs">Confirm {actionType?.replace('_', '-')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
