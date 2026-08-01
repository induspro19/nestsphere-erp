import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { CalendarCheck, Plus, Clock, Users, X, CheckCircle2, Ticket } from 'lucide-react';
import { toast } from 'sonner';

export const ResidentAmenitiesPage: React.FC = () => {
  const [amenities] = useState([
    { id: 'a1', name: 'Clubhouse Banquet Hall', fee: '₹1,500 / hr', status: 'AVAILABLE', capacity: '150 Persons', desc: 'Air-conditioned hall with sound system and catering area' },
    { id: 'a2', name: 'Tennis Court', fee: 'Free for Residents', status: 'AVAILABLE', capacity: '4 Players max', desc: 'Synthetic floodlit court with net equipment' },
    { id: 'a3', name: 'Swimming Pool Slot', fee: 'Free for Residents', status: 'AVAILABLE', capacity: '20 Persons / slot', desc: 'Temperature-controlled pool with lifeguard on duty' },
    { id: 'a4', name: 'Gymnasium Personal Slot', fee: 'Free for Residents', status: 'AVAILABLE', capacity: '15 Persons / slot', desc: 'Fully equipped fitness center with cardio and weights' },
  ]);

  const [activeBookings, setActiveBookings] = useState([
    {
      id: 'b1',
      amenityName: 'Tennis Court',
      date: '2026-08-01',
      slot: '07:00 AM - 08:00 AM',
      guests: 2,
      status: 'CONFIRMED',
      passCode: 'TC-99402',
    },
  ]);

  const [selectedAmenity, setSelectedAmenity] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    slot: '09:00 AM - 11:00 AM',
    guests: '2',
    notes: '',
  });

  const handleOpenBooking = (amenity: any) => {
    setSelectedAmenity(amenity);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity) return;

    const newBooking = {
      id: `b_${Date.now()}`,
      amenityName: selectedAmenity.name,
      date: bookingForm.date,
      slot: bookingForm.slot,
      guests: parseInt(bookingForm.guests) || 1,
      status: 'CONFIRMED',
      passCode: `PASS-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    setActiveBookings([newBooking, ...activeBookings]);
    toast.success(`🎉 Slot successfully booked for ${selectedAmenity.name}! Entry pass ${newBooking.passCode} generated.`);
    setShowBookingModal(false);
  };

  const handleCancelBooking = (id: string, name: string) => {
    setActiveBookings(activeBookings.filter((b) => b.id !== id));
    toast.info(`Booking for ${name} cancelled.`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-primary" /> Book Society Amenities
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Clubhouse hall, tennis court, swimming pool, and gym slot bookings</p>
        </div>
      </div>

      {/* Available Amenities Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm font-display uppercase tracking-wider text-muted-foreground">Available Amenities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {amenities.map((item) => (
            <div key={item.id} className="p-5 rounded-2xl bg-card border border-border/40 hover:border-primary/40 transition-all space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base font-display text-foreground">{item.name}</h3>
                <Badge variant="outline" className="text-xs font-semibold">{item.fee}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-primary" /> {item.capacity}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-emerald-500" /> Slot Booking
                </span>
              </div>
              <Button size="sm" onClick={() => handleOpenBooking(item)} className="w-full text-xs gap-1.5 shadow-sm">
                <Ticket className="h-4 w-4" /> Book Slot Now
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Resident Bookings */}
      <div className="space-y-3 pt-4">
        <h3 className="font-bold text-sm font-display uppercase tracking-wider text-muted-foreground">My Active Bookings ({activeBookings.length})</h3>
        {activeBookings.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-2xl border border-border/40 text-muted-foreground text-xs italic">
            No active amenity slot bookings found. Select an amenity above to reserve your slot.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl bg-card border border-border/40 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-foreground">{b.amenityName}</h4>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> {b.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Date: <strong>{b.date}</strong> | Slot: <strong>{b.slot}</strong></p>
                  <p className="text-xs text-muted-foreground">Pass Code: <strong className="font-mono text-primary">{b.passCode}</strong> ({b.guests} Guests)</p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/20">
                  <Button size="sm" variant="ghost" className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={() => handleCancelBooking(b.id, b.amenityName)}>
                    Cancel Slot
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedAmenity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <div>
                <h3 className="font-bold text-lg font-display">{selectedAmenity.name}</h3>
                <p className="text-xs text-muted-foreground">Fee: {selectedAmenity.fee}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setShowBookingModal(false)} className="h-8 w-8 p-0 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground">Select Booking Date *</label>
                <Input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-foreground">Select Time Slot *</label>
                <select
                  value={bookingForm.slot}
                  onChange={(e) => setBookingForm({ ...bookingForm, slot: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs"
                >
                  <option value="07:00 AM - 09:00 AM">07:00 AM - 09:00 AM (Morning Slot)</option>
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Forenoon Slot)</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon Slot)</option>
                  <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM (Evening Slot)</option>
                  <option value="08:00 PM - 10:00 PM">08:00 PM - 10:00 PM (Night Slot)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground">Number of Guests / Players</label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={bookingForm.guests}
                  onChange={(e) => setBookingForm({ ...bookingForm, guests: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-foreground">Booking Purpose / Event Notes</label>
                <Input
                  placeholder="e.g. Birthday celebration / Morning match"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                />
              </div>

              <div className="p-3 bg-accent/30 rounded-xl border border-border/30 flex items-center justify-between text-xs font-semibold">
                <span>Total Payable Amount</span>
                <span className="text-primary font-bold">{selectedAmenity.fee}</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/20">
                <Button type="button" variant="outline" onClick={() => setShowBookingModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Confirm & Book Slot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
