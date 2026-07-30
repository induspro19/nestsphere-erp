import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import {
  User,
  CalendarCheck,
  UserCheck,
  ParkingCircle,
  FileText,
  ShieldAlert,
  Settings,
  ChevronRight,
  Home,
  Sliders,
} from 'lucide-react';

export const ResidentMorePage: React.FC = () => {
  const navigate = useNavigate();

  const menuGroups = [
    {
      title: 'Resident Portal Services',
      items: [
        { title: 'My Profile & Unit', path: '/resident/profile', icon: User, desc: 'Digital ID, family members, emergency contacts' },
        { title: 'Meetings & AGM', path: '/resident/meetings', icon: CalendarCheck, desc: 'Agendas, Google Meet online link, minutes' },
        { title: 'Pre-Approve Visitors', path: '/resident/visitors', icon: UserCheck, desc: 'Gate passes, Universal QR code generation' },
        { title: 'Amenity Bookings', path: '/resident/amenities', icon: CalendarCheck, desc: 'Clubhouse hall, tennis court, pool slot booking' },
        { title: 'Parking & Vehicles', path: '/resident/parking', icon: ParkingCircle, desc: 'Allocated slots, registered vehicles, PUC alerts' },
        { title: 'Documents & Vault', path: '/resident/documents', icon: FileText, desc: 'Share certificate, agreements, bills, receipts' },
        { title: 'Emergency SOS', path: '/resident/sos', icon: ShieldAlert, desc: '1-Tap Security, Fire, Ambulance & Police alert' },
      ],
    },
    {
      title: 'System & Admin',
      items: [
        { title: 'Full ERP Admin Shell', path: '/dashboard', icon: Sliders, desc: 'Switch to full Housing Society ERP management view' },
        { title: 'Settings', path: '/settings', icon: Settings, desc: 'App preferences and notifications' },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">More Portal Services</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Access profile, meetings, visitors, amenities, parking, and documents</p>
      </div>

      <div className="space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground px-1">{group.title}</h3>
            <div className="bg-card rounded-2xl border border-border/40 divide-y divide-border/20 overflow-hidden">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="p-4 flex items-center justify-between hover:bg-accent/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
