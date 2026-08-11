import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  User, 
  Phone, 
  Mail, 
  Home, 
  Users, 
  Plus, 
  Edit3, 
  Camera, 
  Car, 
  Shield, 
  Download, 
  Printer, 
  Share2, 
  Building, 
  BadgeCheck, 
  Bell, 
  Globe, 
  Trash2, 
  PhoneCall, 
  Sparkles,
  CreditCard,
  FileText,
  Clock,
  X,
  Building2,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { generateResidentIdentityCardPDF } from '../../utils/reportExport';

export const ResidentProfilePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  // Core Profile State
  const [profile, setProfile] = useState({
    name: `${user?.firstName || 'Resident'} ${user?.lastName || 'User'}`.trim(),
    digitalId: 'DIG-884920',
    email: user?.email || 'resident@society.com',
    phone: (user as any)?.phone || '+91 98765 43210',
    flat: `Flat ${(user as any)?.flatNumber || 'A-402'}`,
    tower: 'Tower A',
    wing: 'Wing 1',
    societyName: 'Greenfield Heights Cooperative Society',
    occupancy: 'Owner Occupied',
    memberSince: 'January 2024',
    emergencyContactName: 'Rajesh Sharma',
    emergencyContactRelation: 'Brother',
    emergencyContactPhone: '+91 98765 00000',
    parkingSlots: 'A-402-P1, A-402-P2',
  });

  // Family Members Roster
  const [familyMembers, setFamilyMembers] = useState([
    { id: 'fm-1', name: 'Priya Sharma', relation: 'Spouse', mobile: '+91 98765 11111', isPrimary: true },
    { id: 'fm-2', name: 'Aarav Sharma', relation: 'Son', mobile: '+91 98765 22222', isPrimary: false },
  ]);

  // Registered Vehicles
  const [vehicles, setVehicles] = useState([
    { id: 'v-1', number: 'MH-12-AB-1234', type: '4 Wheeler (SUV)', slot: 'A-402-P1', rfidStatus: 'ACTIVE' },
    { id: 'v-2', number: 'MH-12-CD-5678', type: '2 Wheeler', slot: 'A-402-P2', rfidStatus: 'ACTIVE' },
  ]);

  // Preferences Toggles
  const [preferences, setPreferences] = useState({
    language: 'English (US)',
    whatsappAlerts: true,
    emailAlerts: true,
    smsAlerts: false,
    darkMode: false,
    emergencyBroadcasts: true,
  });

  // Timeline Data
  const activityTimeline = [
    { id: 1, title: 'Maintenance Paid', category: 'Billing', date: '01 Aug 2026', time: '10:30 AM', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
    { id: 2, title: 'Visitor Approved', category: 'Gate Pass', date: '05 Aug 2026', time: '06:30 PM', icon: Shield, color: 'text-blue-600 bg-blue-50' },
    { id: 3, title: 'Document Uploaded', category: 'Vault', date: '10 Jul 2026', time: '02:15 PM', icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
    { id: 4, title: 'Vehicle Added', category: 'Parking', date: '15 Feb 2024', time: '11:00 AM', icon: Car, color: 'text-amber-600 bg-amber-50' },
    { id: 5, title: 'Joined Society ERP', category: 'Onboarding', date: '15 Jan 2024', time: '09:00 AM', icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
  ];

  // Modal Controls
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);

  const [familyForm, setFamilyForm] = useState({ name: '', relation: 'Spouse', mobile: '' });
  const [vehicleForm, setVehicleForm] = useState({ number: '', type: '4 Wheeler', slot: '' });

  // Handlers
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
    setShowEditModal(false);
  };

  const handleAddFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyForm.name.trim()) return;
    setFamilyMembers([...familyMembers, { id: `fm-${Date.now()}`, ...familyForm, isPrimary: false }]);
    toast.success(`Added ${familyForm.name} to family roster.`);
    setFamilyForm({ name: '', relation: 'Spouse', mobile: '' });
    setShowFamilyModal(false);
  };

  const handleDeleteFamily = (id: string, name: string) => {
    setFamilyMembers(familyMembers.filter((m) => m.id !== id));
    toast.success(`Removed ${name} from family roster.`);
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.number.trim()) return;
    setVehicles([...vehicles, { id: `v-${Date.now()}`, ...vehicleForm, rfidStatus: 'ACTIVE' }]);
    toast.success(`Registered vehicle ${vehicleForm.number}.`);
    setVehicleForm({ number: '', type: '4 Wheeler', slot: '' });
    setShowVehicleModal(false);
  };

  const handleDeleteVehicle = (id: string, number: string) => {
    setVehicles(vehicles.filter((v) => v.id !== id));
    toast.success(`Removed vehicle ${number}.`);
  };

  const handleDownloadIdPDF = () => {
    generateResidentIdentityCardPDF({
      ...profile,
      familyCount: familyMembers.length,
      vehicleCount: vehicles.length,
    });
  };

  const handlePrintIdCard = () => {
    window.print();
  };

  const handleShareId = () => {
    const text = `Official Resident ID Card\nName: ${profile.name}\nDigital ID: ${profile.digitalId}\nFlat: ${profile.flat}\nSociety: ${profile.societyName}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePhotoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      toast.success('Profile photo updated successfully!');
    };
    input.click();
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300 max-w-7xl mx-auto">
      
      {/* Print Styles for Dedicated A5 Printable Resident Card */}
      <style>{`
        @media print {
          @page {
            size: A5 portrait;
            margin: 0mm;
          }
          body {
            background: #ffffff !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printResidentCard, #printResidentCard * {
            visibility: visible !important;
          }
          #printResidentCard {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 148mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 999999 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      {/* ------------------------------------------------------------- */}
      {/* A5 DEDICATED PRINTABLE RESIDENT IDENTITY CARD (#printResidentCard) */}
      {/* ------------------------------------------------------------- */}
      <div id="printResidentCard" className="hidden print:block bg-white text-slate-900 font-sans border border-slate-300 w-[148mm] h-[210mm] overflow-hidden relative shadow-lg mx-auto my-0 p-0 rounded-[18px]">
        
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-5 text-center relative border-b-4 border-blue-500">
          <h2 className="text-base font-bold font-display uppercase tracking-wide">{profile.societyName}</h2>
          <p className="text-[10px] text-blue-100 mt-0.5">Premium Smart Housing Society • Managed by NestSphere ERP</p>
          <div className="mt-2 inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white">
            Resident Identity Card
          </div>
        </div>

        {/* Resident Photo & Name */}
        <div className="p-5 text-center space-y-3">
          <div className="h-24 w-24 rounded-full bg-blue-100 text-blue-700 font-bold text-2xl mx-auto flex items-center justify-center border-4 border-blue-600 shadow-md">
            {profile.name.split(' ').map((n) => n[0]).join('')}
          </div>

          <div>
            <h3 className="text-xl font-bold font-display text-slate-900">{profile.name}</h3>
            <p className="text-xs font-bold font-mono text-blue-600 mt-0.5">Digital ID: {profile.digitalId}</p>
          </div>

          {/* Key Details Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 font-bold block text-[9px] uppercase">Unit / Flat</span>
              <span className="font-bold text-slate-900">{profile.flat} ({profile.wing})</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[9px] uppercase">Tower</span>
              <span className="font-bold text-slate-900">{profile.tower}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[9px] uppercase">Resident Type</span>
              <span className="font-bold text-slate-900">{profile.occupancy}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[9px] uppercase">Member Since</span>
              <span className="font-bold text-slate-900">{profile.memberSince}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[9px] uppercase">Phone Number</span>
              <span className="font-semibold text-slate-900">{profile.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[9px] uppercase">Emergency Contact</span>
              <span className="font-semibold text-rose-600">{profile.emergencyContactName} ({profile.emergencyContactPhone})</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[9px] uppercase">Family Roster</span>
              <span className="font-semibold text-slate-900">{familyMembers.length} Members</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[9px] uppercase">Vehicles Registered</span>
              <span className="font-semibold text-slate-900">{vehicles.length} RFID Active</span>
            </div>
          </div>

          {/* Barcode & Security Number Section */}
          <div className="bg-white border border-slate-300 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">RESIDENT SECURITY NO.</p>
              <p className="text-base font-black font-mono tracking-widest text-blue-900">884920</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-slate-400 italic">Authorized Signature</p>
              <p className="text-[9px] font-bold text-slate-700">Society Management Seal</p>
            </div>
          </div>
        </div>

        {/* Footer Helpline */}
        <div className="absolute bottom-0 inset-x-0 bg-slate-900 text-white p-2.5 text-center text-[9px] space-y-0.5">
          <p className="font-bold uppercase tracking-wider text-blue-400">Emergency Helpline & Office</p>
          <p className="text-slate-300">Security Gatehouse: Ext 101 | Society Office: +91 1800 123 4567 | Fire: 101 | Ambulance: 108</p>
        </div>
      </div>

      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-900 flex items-center gap-2.5">
            <User className="h-7 w-7 text-blue-600" /> Resident Profile & Unit Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise resident identity, unit details, family roster, registered vehicles & activity log
          </p>
        </div>

        {/* Quick Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={() => setShowEditModal(true)} size="sm" className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-sm">
            <Edit3 className="h-3.5 w-3.5" /> Edit Profile
          </Button>
          <Button onClick={handlePhotoUpload} size="sm" variant="outline" className="h-9 px-3 rounded-xl border-slate-200 text-xs font-semibold gap-1.5">
            <Camera className="h-3.5 w-3.5 text-blue-600" /> Upload Photo
          </Button>
          <Button onClick={() => setShowIdCardModal(true)} size="sm" variant="outline" className="h-9 px-3 rounded-xl border-slate-200 text-xs font-semibold gap-1.5 bg-blue-50/50 text-blue-700 hover:bg-blue-100">
            <BadgeCheck className="h-3.5 w-3.5 text-blue-600" /> Resident ID Card
          </Button>
          <Button onClick={handleDownloadIdPDF} size="sm" variant="outline" className="h-9 px-3 rounded-xl border-slate-200 text-xs font-semibold gap-1.5">
            <Download className="h-3.5 w-3.5 text-emerald-600" /> Download PDF
          </Button>
          <Button onClick={handleShareId} size="sm" variant="outline" className="h-9 px-3 rounded-xl border-slate-200 text-xs font-semibold gap-1.5">
            <Share2 className="h-3.5 w-3.5 text-indigo-600" /> Share ID
          </Button>
        </div>
      </div>

      {/* Hero Profile Layout: 2 Columns on Desktop (35% Left, 65% Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (35% - Profile Card) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Hero Profile Card */}
          <div className="relative rounded-[22px] bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white p-6 shadow-xl overflow-hidden border border-white/10 flex flex-col justify-between min-h-[320px]">
            {/* Background Pattern Elements */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Avatar & Badges */}
              <div className="flex items-start justify-between">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full bg-white/15 backdrop-blur-md text-white font-bold text-3xl flex items-center justify-center border-2 border-white/40 shadow-inner overflow-hidden">
                    {profile.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <button
                    onClick={handlePhotoUpload}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-white text-blue-700 shadow-lg hover:scale-105 transition-all"
                    title="Upload Photo"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>

                <Badge className="bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold px-3 py-1 flex items-center gap-1 rounded-full">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" /> Verified Resident
                </Badge>
              </div>

              {/* Name & Digital ID */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">{profile.name}</h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge className="bg-white/20 text-white border-none font-mono text-xs px-2.5 py-0.5">
                    {profile.digitalId}
                  </Badge>
                  <Badge className="bg-blue-500/30 text-blue-100 border-none text-[11px] px-2.5 py-0.5">
                    {profile.occupancy}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Member Since & Society Name */}
            <div className="relative z-10 pt-4 border-t border-white/15 text-xs text-blue-100 flex justify-between items-center">
              <span>Member Since <strong className="text-white">{profile.memberSince}</strong></span>
              <span className="font-semibold">{profile.flat}</span>
            </div>
          </div>

          {/* Dedicated Emergency Contact Card */}
          <div className="bg-rose-50/70 border-2 border-rose-200/80 rounded-[20px] p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500 text-white">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-display">Emergency Contact</h3>
                  <p className="text-[11px] text-rose-600 font-medium">SOS & Security Protocol Contact</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setShowEditModal(true)} className="h-7 text-xs text-rose-700 hover:bg-rose-100 px-2 rounded-lg font-semibold">
                Edit
              </Button>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-rose-100 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">{profile.emergencyContactName}</span>
                <Badge variant="outline" className="text-[10px] border-rose-300 text-rose-700 font-semibold">{profile.emergencyContactRelation}</Badge>
              </div>
              <p className="font-mono text-slate-600 font-medium">{profile.emergencyContactPhone}</p>
            </div>

            <a href={`tel:${profile.emergencyContactPhone}`} className="block">
              <Button className="w-full h-10 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs gap-2">
                <PhoneCall className="h-4 w-4" /> Call Emergency Contact
              </Button>
            </a>
          </div>

        </div>

        {/* RIGHT COLUMN (65% - Personal & Unit Details Grid) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Information Grid Cards */}
          <div className="bg-white rounded-[22px] p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-base font-display text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="h-5 w-5 text-blue-600" /> Personal Information & Unit Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100/80 text-blue-700 shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                  <p className="font-semibold text-slate-900 truncate">{profile.email}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100/80 text-blue-700 shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone Number</p>
                  <p className="font-semibold text-slate-900 truncate">{profile.phone}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100/80 text-indigo-700 shrink-0">
                  <Home className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Flat & Wing</p>
                  <p className="font-semibold text-slate-900 truncate">{profile.flat} ({profile.wing})</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100/80 text-indigo-700 shrink-0">
                  <Building className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tower</p>
                  <p className="font-semibold text-slate-900 truncate">{profile.tower}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100/80 text-emerald-700 shrink-0">
                  <Car className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Parking Slots</p>
                  <p className="font-semibold text-slate-900 truncate">{profile.parkingSlots}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-100/80 text-purple-700 shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Family Members</p>
                  <p className="font-semibold text-slate-900 truncate">{familyMembers.length} Registered</p>
                </div>
              </div>

            </div>
          </div>

          {/* Family Members Cards */}
          <div className="bg-white rounded-[22px] p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base font-display text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" /> Family Members ({familyMembers.length})
              </h3>
              <Button onClick={() => setShowFamilyModal(true)} size="sm" className="h-8 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border-none gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Family Member
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {familyMembers.map((fm) => (
                <div key={fm.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-blue-300 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-200">
                      {fm.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{fm.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{fm.relation} • {fm.mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {fm.isPrimary && (
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border-none">Primary</Badge>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteFamily(fm.id, fm.name)} className="h-7 w-7 text-slate-400 hover:text-rose-600 rounded-lg">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Registered Vehicles Cards */}
          <div className="bg-white rounded-[22px] p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base font-display text-slate-900 flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" /> Registered Vehicles ({vehicles.length})
              </h3>
              <Button onClick={() => setShowVehicleModal(true)} size="sm" className="h-8 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border-none gap-1">
                <Plus className="h-3.5 w-3.5" /> Register Vehicle
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {vehicles.map((v) => (
                <div key={v.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-blue-300 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-mono font-black text-sm text-slate-900">{v.number}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{v.type} • Slot {v.slot}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-emerald-100 text-emerald-800 border-none text-[10px] font-bold px-2 py-0.5">RFID Active</Badge>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteVehicle(v.id, v.number)} className="h-7 w-7 text-slate-400 hover:text-rose-600 rounded-lg">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* LOWER SECTION: Preferences & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Resident Preferences Settings */}
        <div className="lg:col-span-6 bg-white rounded-[22px] p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-base font-display text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="h-5 w-5 text-blue-600" /> Resident Preferences & Alerts
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-slate-500" />
                <span className="font-semibold text-slate-900">Portal Language</span>
              </div>
              <span className="font-bold text-blue-600">{preferences.language}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Bell className="h-4 w-4 text-slate-500" />
                <span className="font-semibold text-slate-900">WhatsApp Visitor Notifications</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.whatsappAlerts}
                onChange={(e) => setPreferences({ ...preferences, whatsappAlerts: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="font-semibold text-slate-900">Email Monthly Maintenance Invoices</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailAlerts}
                onChange={(e) => setPreferences({ ...preferences, emailAlerts: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 text-slate-500" />
                <span className="font-semibold text-slate-900">Emergency SOS Gatekeeper Callout</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.emergencyBroadcasts}
                onChange={(e) => setPreferences({ ...preferences, emergencyBroadcasts: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-6 bg-white rounded-[22px] p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-base font-display text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="h-5 w-5 text-blue-600" /> Resident Activity Timeline
          </h3>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {activityTimeline.map((item) => {
              const IconComp = item.icon;
              return (
                <div key={item.id} className="relative flex items-start gap-3 text-xs">
                  <div className={`absolute -left-6 p-1 rounded-full border border-white shadow-2xs ${item.color}`}>
                    <IconComp className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{item.category}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{item.date} • {item.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RESIDENT ID CARD PREVIEW MODAL */}
      {showIdCardModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] w-full max-w-lg shadow-2xl p-6 space-y-5 border border-slate-100 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-lg font-display text-slate-900 flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-blue-600" /> Resident Identity Card (A5 Format)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Printable corporate A5 card with security barcodes</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowIdCardModal(false)} className="h-8 w-8 rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* A5 Card Preview Box */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex justify-center">
              <div className="bg-white border border-slate-300 rounded-[16px] shadow-lg w-[260px] p-4 text-center space-y-3 relative overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-2.5 -mx-4 -mt-4 mb-2">
                  <p className="text-[9px] font-bold uppercase truncate">{profile.societyName}</p>
                  <p className="text-[7px] text-blue-100">Resident Identity Card</p>
                </div>

                <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-700 font-bold text-xl mx-auto flex items-center justify-center border-2 border-blue-600 shadow-sm">
                  {profile.name.split(' ').map((n) => n[0]).join('')}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">{profile.name}</h4>
                  <p className="text-[10px] font-mono font-bold text-blue-600">ID: {profile.digitalId}</p>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg text-[9px] text-left space-y-0.5 border border-slate-200">
                  <p><strong>Flat:</strong> {profile.flat} ({profile.wing})</p>
                  <p><strong>Type:</strong> {profile.occupancy}</p>
                  <p><strong>Phone:</strong> {profile.phone}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded p-1 text-[8px] font-mono text-center font-bold text-blue-900">
                  SECURITY NO. 884920
                </div>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handlePrintIdCard} className="flex-1 bg-slate-900 hover:bg-black text-white font-bold text-xs h-11 rounded-xl gap-1.5">
                <Printer className="h-4 w-4" /> Print A5 Card
              </Button>
              <Button onClick={handleDownloadIdPDF} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 rounded-xl gap-1.5">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
              <Button onClick={handleShareId} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 rounded-xl gap-1.5">
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-lg font-display text-slate-900">Edit Profile Details</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required className="h-10 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required className="h-10 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} required className="h-10 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Emergency Contact Name</label>
                <Input value={profile.emergencyContactName} onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })} required className="h-10 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Emergency Contact Phone</label>
                <Input value={profile.emergencyContactPhone} onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })} required className="h-10 rounded-xl" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD FAMILY MODAL */}
      {showFamilyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-lg font-display text-slate-900">Add Family Member</h3>
            <form onSubmit={handleAddFamily} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <Input value={familyForm.name} onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })} required className="h-10 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Relationship</label>
                <select
                  value={familyForm.relation}
                  onChange={(e) => setFamilyForm({ ...familyForm, relation: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Parent">Parent</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
                <Input value={familyForm.mobile} onChange={(e) => setFamilyForm({ ...familyForm, mobile: e.target.value })} required className="h-10 rounded-xl" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowFamilyModal(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">Add Member</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD VEHICLE MODAL */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-lg font-display text-slate-900">Register Vehicle</h3>
            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Vehicle Plate Number *</label>
                <Input value={vehicleForm.number} placeholder="MH-12-AB-1234" onChange={(e) => setVehicleForm({ ...vehicleForm, number: e.target.value })} required className="h-10 rounded-xl uppercase font-mono" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Vehicle Type</label>
                <select
                  value={vehicleForm.type}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="4 Wheeler (SUV)">4 Wheeler (SUV)</option>
                  <option value="2 Wheeler">2 Wheeler</option>
                  <option value="EV Vehicle">EV Vehicle</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Allocated Parking Slot</label>
                <Input value={vehicleForm.slot} placeholder="A-402-P1" onChange={(e) => setVehicleForm({ ...vehicleForm, slot: e.target.value })} required className="h-10 rounded-xl uppercase font-mono" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowVehicleModal(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">Register</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
