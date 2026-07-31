import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { User, Phone, Mail, Home, Users, Plus, Edit3, Camera, Car, Shield } from 'lucide-react';
import { toast } from 'sonner';

export const ResidentProfilePage: React.FC = () => {
  const [profile, setProfile] = useState({
    name: 'Resident User',
    digitalId: 'DIG-884920',
    email: 'resident@society.com',
    phone: '+91 98765 43210',
    flat: 'Flat A-402, Grand Heights',
    occupancy: 'Owner Occupied',
    emergencyContact: '+91 98765 00000',
  });

  const [familyMembers, setFamilyMembers] = useState([
    { name: 'Priya Sharma', relation: 'Spouse', mobile: '+91 98765 11111' },
    { name: 'Aarav Sharma', relation: 'Son', mobile: '+91 98765 22222' },
  ]);

  const [vehicles, setVehicles] = useState([
    { number: 'MH-12-AB-1234', type: '4 Wheeler (SUV)', slot: 'A-402-P1' },
    { number: 'MH-12-CD-5678', type: '2 Wheeler', slot: 'A-402-P2' },
  ]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  const [familyForm, setFamilyForm] = useState({ name: '', relation: 'Spouse', mobile: '' });
  const [vehicleForm, setVehicleForm] = useState({ number: '', type: '4 Wheeler', slot: '' });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
    setShowEditModal(false);
  };

  const handleAddFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyForm.name) return;
    setFamilyMembers([...familyMembers, familyForm]);
    toast.success(`Added ${familyForm.name} to family roster.`);
    setFamilyForm({ name: '', relation: 'Spouse', mobile: '' });
    setShowFamilyModal(false);
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.number) return;
    setVehicles([...vehicles, vehicleForm]);
    toast.success(`Registered vehicle ${vehicleForm.number}.`);
    setVehicleForm({ number: '', type: '4 Wheeler', slot: '' });
    setShowVehicleModal(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <User className="h-6 w-6 text-primary" /> My Profile & Unit Details
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Personal details, digital ID, family members, and emergency contacts</p>
        </div>
        <Button onClick={() => setShowEditModal(true)} size="sm" variant="outline" className="gap-1.5 text-xs">
          <Edit3 className="h-4 w-4" /> Edit Profile
        </Button>
      </div>

      {/* Main Profile Card */}
      <div className="p-6 bg-card rounded-2xl border border-border/40 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center border border-primary/30">
                RU
              </div>
              <button
                onClick={() => toast.info('Photo upload triggered')}
                className="absolute bottom-0 right-0 p-1 rounded-full bg-primary text-primary-foreground shadow"
                aria-label="Upload Photo"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-bold font-display">{profile.name}</h2>
              <p className="text-xs text-muted-foreground">Digital ID: <strong className="font-mono text-primary">{profile.digitalId}</strong></p>
              <Badge variant="outline" className="text-[10px] mt-1">{profile.occupancy}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <span>{profile.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-primary" />
            <span>{profile.flat}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-rose-500" />
            <span>Emergency Contact: {profile.emergencyContact}</span>
          </div>
        </div>
      </div>

      {/* Family Members Section */}
      <div className="p-6 bg-card rounded-2xl border border-border/40 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm font-display flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Family Members ({familyMembers.length})
          </h3>
          <Button onClick={() => setShowFamilyModal(true)} size="sm" variant="ghost" className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Family Member
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {familyMembers.map((fm, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-accent/30 border border-border/20 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs">{fm.name}</h4>
                <p className="text-[11px] text-muted-foreground">{fm.relation} • {fm.mobile}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">{fm.relation}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Registered Vehicles Section */}
      <div className="p-6 bg-card rounded-2xl border border-border/40 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm font-display flex items-center gap-2">
            <Car className="h-4 w-4 text-primary" /> Registered Vehicles ({vehicles.length})
          </h3>
          <Button onClick={() => setShowVehicleModal(true)} size="sm" variant="ghost" className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Register Vehicle
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {vehicles.map((v, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-accent/30 border border-border/20 flex items-center justify-between">
              <div>
                <h4 className="font-mono font-bold text-xs text-primary">{v.number}</h4>
                <p className="text-[11px] text-muted-foreground">{v.type} • Slot {v.slot}</p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">RFID Active</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg font-display">Edit Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Full Name</label>
                <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
              </div>
              <div>
                <label className="font-semibold">Email Address</label>
                <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
              </div>
              <div>
                <label className="font-semibold">Mobile Number</label>
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} required />
              </div>
              <div>
                <label className="font-semibold">Emergency Contact</label>
                <Input value={profile.emergencyContact} onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Family Modal */}
      {showFamilyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg font-display">Add Family Member</h3>
            <form onSubmit={handleAddFamily} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Full Name *</label>
                <Input value={familyForm.name} onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })} required />
              </div>
              <div>
                <label className="font-semibold">Relationship</label>
                <select
                  value={familyForm.relation}
                  onChange={(e) => setFamilyForm({ ...familyForm, relation: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Parent">Parent</option>
                </select>
              </div>
              <div>
                <label className="font-semibold">Mobile Number</label>
                <Input value={familyForm.mobile} onChange={(e) => setFamilyForm({ ...familyForm, mobile: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowFamilyModal(false)}>Cancel</Button>
                <Button type="submit">Add Member</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg font-display">Register Vehicle</h3>
            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Vehicle Plate Number *</label>
                <Input value={vehicleForm.number} placeholder="MH-12-AB-1234" onChange={(e) => setVehicleForm({ ...vehicleForm, number: e.target.value })} required />
              </div>
              <div>
                <label className="font-semibold">Vehicle Type</label>
                <select
                  value={vehicleForm.type}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background"
                >
                  <option value="4 Wheeler">4 Wheeler</option>
                  <option value="2 Wheeler">2 Wheeler</option>
                  <option value="EV Vehicle">EV Vehicle</option>
                </select>
              </div>
              <div>
                <label className="font-semibold">Allocated Parking Slot</label>
                <Input value={vehicleForm.slot} placeholder="A-402-P1" onChange={(e) => setVehicleForm({ ...vehicleForm, slot: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowVehicleModal(false)}>Cancel</Button>
                <Button type="submit">Register</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
