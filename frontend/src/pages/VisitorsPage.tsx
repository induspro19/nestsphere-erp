import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import { visitorApi, VisitorPass, VisitorAnalytics } from '../api/visitor.api';
import {
  UserCheck,
  QrCode,
  KeyRound,
  LogOut,
  Plus,
  Search,
  Users,
  CheckCircle,
  Clock,
  Car,
  PhoneCall,
  X,
} from 'lucide-react';

export const VisitorsPage: React.FC = () => {
  const [passes, setPasses] = useState<VisitorPass[]>([]);
  const [analytics, setAnalytics] = useState<VisitorAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<VisitorPass | null>(null);

  // Pass Form state
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorType, setVisitorType] = useState('GUEST');
  const [passType, setPassType] = useState('PRE_APPROVED');
  const [purpose, setPurpose] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  // Check-In Form state
  const [otpCodeInput, setOtpCodeInput] = useState('');

  useEffect(() => {
    fetchData();
  }, [search, selectedType, selectedStatus]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [passesRes, analRes] = await Promise.all([
        visitorApi.getVisitorPasses({
          search,
          visitorType: selectedType || undefined,
          status: selectedStatus || undefined,
        }),
        visitorApi.getAnalytics(),
      ]);
      setPasses(passesRes.data || []);
      setAnalytics(analRes);
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await visitorApi.createPass({
        visitorName,
        visitorPhone,
        visitorType,
        passType,
        purpose,
        vehicleNumber: vehicleNumber || undefined,
      });
      setIsCreateModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate visitor pass');
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await visitorApi.checkIn({ otpCode: otpCodeInput });
      setIsCheckInModalOpen(false);
      setOtpCodeInput('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (passId: string) => {
    try {
      await visitorApi.checkOut(passId);
      fetchData();
    } catch {
      alert('Check-out failed');
    }
  };

  const resetForm = () => {
    setVisitorName('');
    setVisitorPhone('');
    setPurpose('');
    setVehicleNumber('');
  };

  const visitorTypeOptions = [
    'GUEST',
    'RELATIVE',
    'FRIEND',
    'VENDOR',
    'COURIER',
    'FOOD_DELIVERY',
    'CAB_DRIVER',
    'SERVICE_ENGINEER',
    'TECHNICIAN',
    'HOUSEKEEPING',
    'GOVERNMENT_OFFICER',
    'POLICE',
    'FIRE_BRIGADE',
    'AMBULANCE',
    'INTERVIEW_CANDIDATE',
    'TEMPORARY_WORKER',
  ];

  const columns = [
    {
      header: 'Visitor & Pass ID',
      accessorKey: (row: VisitorPass) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{row.visitorName}</span>
            <Badge variant="outline" className="text-[10px]">
              {row.visitorType.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Pass: {row.passNumber} | Phone: {row.visitorPhone}
          </p>
        </div>
      ),
    },
    {
      header: 'Entry Code / Pass OTP',
      accessorKey: (row: VisitorPass) => (
        <div className="text-xs space-y-0.5">
          <Badge variant="secondary" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
            OTP: {row.otpCode}
          </Badge>
          {row.vehicleNumber && <p className="text-muted-foreground font-mono">Vehicle: {row.vehicleNumber}</p>}
        </div>
      ),
    },
    {
      header: 'Arrival & Exit Time',
      accessorKey: (row: VisitorPass) => (
        <div className="text-xs space-y-0.5">
          {row.actualArrival ? (
            <p className="text-emerald-500 font-medium">In: {new Date(row.actualArrival).toLocaleTimeString()}</p>
          ) : (
            <p className="text-amber-500 font-medium">Expected: {new Date(row.expectedArrival || Date.now()).toLocaleTimeString()}</p>
          )}
          {row.actualExit && (
            <p className="text-muted-foreground">Out: {new Date(row.actualExit).toLocaleTimeString()}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: (row: VisitorPass) => {
        if (row.status === 'CHECKED_IN') {
          return (
            <Badge variant="success" className="gap-1 text-[10px]">
              <CheckCircle className="h-3 w-3" /> CHECKED IN
            </Badge>
          );
        }
        if (row.status === 'PRE_APPROVED') {
          return (
            <Badge variant="outline" className="gap-1 text-[10px] text-sky-600 border-sky-500/30">
              <Clock className="h-3 w-3 text-sky-500" /> PRE-APPROVED
            </Badge>
          );
        }
        return (
          <Badge variant="secondary" className="text-[10px]">
            {row.status}
          </Badge>
        );
      },
    },
    {
      header: 'Action',
      accessorKey: (row: VisitorPass) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'CHECKED_IN' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCheckOut(row.id)}
              className="h-8 px-2 text-xs text-destructive rounded-lg hover:bg-destructive/10"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" /> Check Out
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedPass(row)}
              className="h-8 px-2 text-xs rounded-lg"
            >
              Digital Pass
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-border/40 bg-gradient-to-r from-card via-accent/30 to-background flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" /> Enterprise Visitor Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pre-approved passes, OTP verification, instant gate clearance, and frequent visitor analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsCheckInModalOpen(true)} className="rounded-xl">
            <KeyRound className="h-4 w-4 mr-2" /> Verify OTP Check-In
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" /> Pre-Approve Visitor
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Visitor Entries" value={analytics?.totalCount || 0} description="All-Time Visitor Passes" icon={Users} />
        <StatCard title="Currently Inside" value={analytics?.checkedInCount || 0} description="Gate Checked In" icon={UserCheck} />
        <StatCard title="Frequent Visitors" value={analytics?.frequentVisitors.length || 0} description="Recurring Regulars" icon={PhoneCall} />
        <StatCard title="Verification Mode" value="OTP + QR" description="Gate Barrier Ready" icon={QrCode} />
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by visitor name, phone, or pass #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Visitor Types (16 Categories)</option>
              {visitorTypeOptions.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Pass Statuses</option>
              <option value="PRE_APPROVED">Pre-Approved</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="CHECKED_OUT">Checked Out</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {isLoading ? (
        <LoadingSpinner message="Fetching visitor pass records..." />
      ) : (
        <DataTable columns={columns} data={passes} emptyMessage="No visitor passes match your search criteria." />
      )}

      {/* Modal: Pre-Approve Visitor */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Create Visitor Pass</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreatePass} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Pass Mode</label>
                  <select
                    value={passType}
                    onChange={(e) => setPassType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                  >
                    <option value="PRE_APPROVED">PRE-APPROVED (Pre-scheduled)</option>
                    <option value="INSTANT">INSTANT (Immediate Gate Entry)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Visitor Category *</label>
                  <select
                    value={visitorType}
                    onChange={(e) => setVisitorType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                  >
                    {visitorTypeOptions.map((t) => (
                      <option key={t} value={t}>{t.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Visitor Name *</label>
                  <Input value={visitorName} onChange={(e) => setVisitorName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Phone Number *</label>
                  <Input value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Purpose of Visit</label>
                  <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Personal Visit / Package Delivery" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Vehicle Number</label>
                  <Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="MH-12-DE-9999" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Generate Visitor Pass Code
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: OTP Verification Check-In */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" /> Verify Pass OTP Code
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsCheckInModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Enter 6-Digit Pass OTP</label>
                <Input
                  value={otpCodeInput}
                  onChange={(e) => setOtpCodeInput(e.target.value)}
                  placeholder="e.g. 849201"
                  className="text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsCheckInModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Verify & Unlock Gate Entry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Digital QR Visitor Pass Card */}
      {selectedPass && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Digital Visitor Pass</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedPass(null)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/30 text-center space-y-3">
              <Badge variant="outline" className="text-[10px] font-mono uppercase">{selectedPass.passType}</Badge>
              <h4 className="font-bold text-lg">{selectedPass.visitorName}</h4>
              <p className="text-xs text-muted-foreground">{selectedPass.visitorType} | Phone: {selectedPass.visitorPhone}</p>

              <div className="py-2 flex flex-col items-center justify-center bg-card/80 p-3 rounded-xl border border-border/30">
                <QrCode className="h-16 w-16 text-primary mb-1" />
                <p className="font-mono text-sm font-bold tracking-widest text-foreground">OTP: {selectedPass.otpCode}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{selectedPass.passNumber}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedPass(null)} className="rounded-xl">
                Close Pass
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
