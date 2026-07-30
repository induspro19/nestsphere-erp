import React from 'react';
import { Badge } from '../../components/ui/badge';
import { User, Phone, Mail, Home, Shield, Users } from 'lucide-react';

export const ResidentProfilePage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
          <User className="h-6 w-6 text-primary" /> My Profile & Unit Details
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Personal details, digital ID, family members, and emergency contacts</p>
      </div>

      <div className="p-6 bg-card rounded-2xl border border-border/40 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center border border-primary/30">
            RU
          </div>
          <div>
            <h2 className="text-lg font-bold font-display">Resident User</h2>
            <p className="text-xs text-muted-foreground">Digital ID: <strong>DIG-884920</strong></p>
            <Badge variant="outline" className="text-[10px] mt-1">Owner Occupied</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>resident@society.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>+91 98765 43210</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <span>Flat A-402, Grand Heights</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>3 Registered Family Members</span>
          </div>
        </div>
      </div>
    </div>
  );
};
