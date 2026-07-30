import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import {
  accessControlApi,
  LiveOccupancyResponse,
  AccessLog,
  AccessRule,
} from '../api/accessControl.api';
import {
  ShieldCheck,
  DoorOpen,
  LogOut,
  AlertTriangle,
  Siren,
  QrCode,
  Car,
  Plus,
  CheckCircle,
  X,
} from 'lucide-react';

export const AccessControlPage: React.FC = () => {
  const [occupancy, setOccupancy] = useState<LiveOccupancyResponse | null>(null);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [rules, setRules] = useState<AccessRule[]>([]);
  const [overstayAlerts, setOverstayAlerts] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'LOGS' | 'RULES' | 'OVERSTAY'>('LOGS');

  // Log Entry Modal state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  // Form states
  const [accessType, setAccessType] = useState('RESIDENT');
  const [entryMethod, setEntryMethod] = useState('QR_CODE');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  // Rule Form state
  const [ruleType, setRuleType] = useState<'WHITELIST' | 'BLACKLIST'>('BLACKLIST');
  const [entityType, setEntityType] = useState('VEHICLE');
  const [entityValue, setEntityValue] = useState('');
  const [ruleReason, setRuleReason] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [occRes, logsRes, rulesRes, overstayRes] = await Promise.all([
        accessControlApi.getLiveOccupancy(),
        accessControlApi.getAccessLogs(),
        accessControlApi.getAccessRules(),
        accessControlApi.getOverstayAlerts(),
      ]);
      setOccupancy(occRes);
      setLogs(logsRes.data || []);
      setRules(rulesRes);
      setOverstayAlerts(overstayRes);
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await accessControlApi.logEntry({
        gateId: 'default',
        accessType,
        entryMethod,
        vehicleNumber: vehicleNumber || undefined,
        remarks: remarks || undefined,
      });
      setIsEntryModalOpen(false);
      setVehicleNumber('');
      setRemarks('');
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to log entry access');
    }
  };

  const handleEmergencyOverride = async (type: string) => {
    try {
      await accessControlApi.emergencyOverride(type, `Emergency override for ${type}`);
      setIsEmergencyModalOpen(false);
      fetchDashboardData();
    } catch {
      alert('Emergency override failed');
    }
  };

  const handleLogExit = async (logId: string, vehNum?: string) => {
    try {
      await accessControlApi.logExit({
        gateId: 'default',
        accessLogId: logId,
        vehicleNumber: vehNum || undefined,
      });
      fetchDashboardData();
    } catch {
      alert('Exit processing failed');
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await accessControlApi.createAccessRule({
        ruleType,
        entityType,
        entityValue,
        reason: ruleReason,
      });
      setIsRuleModalOpen(false);
      setEntityValue('');
      setRuleReason('');
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add rule');
    }
  };

  const accessTypeOptions = [
    'RESIDENT',
    'OWNER',
    'TENANT',
    'FAMILY_MEMBER',
    'COMMITTEE',
    'VENDOR',
    'DELIVERY',
    'COURIER',
    'CAB',
    'GUEST',
    'TEMPORARY_WORKER',
    'SECURITY_STAFF',
    'MAINTENANCE_STAFF',
    'EMERGENCY_SERVICE',
    'POLICE',
    'FIRE_BRIGADE',
    'AMBULANCE',
  ];

  const entryMethodOptions = [
    'RFID',
    'QR_CODE',
    'FACE_RECOGNITION',
    'OTP',
    'MANUAL_APPROVAL',
    'REMOTE_APPROVAL',
    'BIOMETRIC',
  ];

  const logColumns = [
    {
      header: 'Access & Entity',
      accessorKey: (row: AccessLog) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              {row.person ? `${row.person.firstName} ${row.person.lastName}` : row.accessType.replace('_', ' ')}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {row.accessType}
            </Badge>
          </div>
          {row.vehicleNumber && <p className="text-xs font-mono text-muted-foreground mt-0.5">Vehicle: {row.vehicleNumber}</p>}
        </div>
      ),
    },
    {
      header: 'Entry Method & Gate',
      accessorKey: (row: AccessLog) => (
        <div className="text-xs">
          <Badge variant="secondary" className="text-[10px]">
            {row.entryMethod.replace('_', ' ')}
          </Badge>
          <p className="text-muted-foreground mt-1">{row.gate?.name || 'Main Gate'}</p>
        </div>
      ),
    },
    {
      header: 'Timestamps & Duration',
      accessorKey: (row: AccessLog) => (
        <div className="text-xs space-y-0.5">
          <p className="text-emerald-500 font-medium">In: {new Date(row.entryTime).toLocaleTimeString()}</p>
          {row.exitTime ? (
            <p className="text-muted-foreground">
              Out: {new Date(row.exitTime).toLocaleTimeString()} ({row.durationMinutes} mins)
            </p>
          ) : (
            <span className="inline-block px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 text-[10px] font-semibold">
              Currently Inside
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Security Flags',
      accessorKey: (row: AccessLog) => (
        <div>
          {row.isOverstay ? (
            <Badge variant="destructive" className="gap-1 text-[10px]">
              <AlertTriangle className="h-3 w-3" /> OVERSTAY
            </Badge>
          ) : (
            <Badge variant="success" className="gap-1 text-[10px]">
              <CheckCircle className="h-3 w-3" /> CLEARED
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Action',
      accessorKey: (row: AccessLog) =>
        !row.exitTime ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleLogExit(row.id, row.vehicleNumber || undefined)}
            className="h-8 px-2 text-xs rounded-lg text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-3.5 w-3.5 mr-1" /> Log Exit
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">Completed</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-border/40 bg-gradient-to-r from-card via-accent/30 to-background flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" /> Enterprise Access Control Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time gate logging, live occupancy tracking, overstay alerts & emergency overrides
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="destructive" onClick={() => setIsEmergencyModalOpen(true)} className="rounded-xl">
            <Siren className="h-4 w-4 mr-2" /> Emergency Override
          </Button>
          <Button onClick={() => setIsEntryModalOpen(true)} className="rounded-xl">
            <DoorOpen className="h-4 w-4 mr-2" /> Log Gate Entry
          </Button>
        </div>
      </div>

      {/* Live Occupancy Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Currently Inside" value={occupancy?.totalInside || 0} description="Live Occupancy Count" icon={DoorOpen} />
        <StatCard title="Active Vehicles Inside" value={occupancy?.activeVehicles || 0} description="Gate Tracked Vehicles" icon={Car} />
        <StatCard title="Overstay Warnings" value={overstayAlerts.length} description="Exceeding 4 Hours Limit" icon={AlertTriangle} />
        <StatCard title="Emergency Overrides" value="Active" description="Police/Fire Brigade Bypasses" icon={Siren} />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'LOGS' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent/60'
          }`}
        >
          Access History Logs
        </button>
        <button
          onClick={() => setActiveTab('OVERSTAY')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'OVERSTAY' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent/60'
          }`}
        >
          Overstay Alerts ({overstayAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('RULES')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'RULES' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent/60'
          }`}
        >
          Whitelist & Blacklist Rules ({rules.length})
        </button>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <LoadingSpinner message="Fetching live access control stream..." />
      ) : activeTab === 'LOGS' ? (
        <DataTable columns={logColumns} data={logs} emptyMessage="No access events logged yet." />
      ) : activeTab === 'OVERSTAY' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Active Overstay Alerts (Exceeding 4 Hours Inside)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overstayAlerts.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No overstay alerts detected. All visitors & vendors are within threshold limits.</div>
            ) : (
              <div className="space-y-3">
                {overstayAlerts.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-destructive">{item.accessType} - {item.vehicleNumber || 'Pedestrian'}</p>
                      <p className="text-xs text-muted-foreground">Entry Time: {new Date(item.entryTime).toLocaleString()}</p>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleLogExit(item.id)} className="rounded-xl">
                      Force Exit Log
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Security Whitelist & Blacklist Rules</CardTitle>
            <Button size="sm" onClick={() => setIsRuleModalOpen(true)} className="rounded-xl">
              <Plus className="h-4 w-4 mr-1" /> Add Security Rule
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rules.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-border/40 bg-accent/20 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{r.entityValue}</span>
                      <Badge variant={r.ruleType === 'BLACKLIST' ? 'destructive' : 'success'} className="text-[10px]">
                        {r.ruleType}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Reason: {r.reason || 'Security Restriction'}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal: Log Gate Entry */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Log Gate Entry Access</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsEntryModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleLogEntry} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Access Type (20 Categories)</label>
                <select
                  value={accessType}
                  onChange={(e) => setAccessType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                >
                  {accessTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Entry Method</label>
                <select
                  value={entryMethod}
                  onChange={(e) => setEntryMethod(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                >
                  {entryMethodOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Vehicle Number (Optional)</label>
                <Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="MH-12-AB-1234" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Security Remarks</label>
                <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Gate clearance details..." />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsEntryModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Log Entry Access
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Emergency Override */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-destructive/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display text-destructive flex items-center gap-2">
                <Siren className="h-5 w-5" /> Emergency Override
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsEmergencyModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Executing emergency override immediately unlocks gate barriers and logs an urgent alert notification.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="destructive" onClick={() => handleEmergencyOverride('POLICE')} className="rounded-xl py-6">
                POLICE (Police Control)
              </Button>
              <Button variant="destructive" onClick={() => handleEmergencyOverride('FIRE_BRIGADE')} className="rounded-xl py-6">
                FIRE BRIGADE
              </Button>
              <Button variant="destructive" onClick={() => handleEmergencyOverride('AMBULANCE')} className="rounded-xl py-6">
                AMBULANCE
              </Button>
              <Button variant="destructive" onClick={() => handleEmergencyOverride('EMERGENCY_SERVICE')} className="rounded-xl py-6">
                UTILITY EMERGENCY
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Security Rule */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Add Security Access Rule</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsRuleModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Rule Type</label>
                <select
                  value={ruleType}
                  onChange={(e: any) => setRuleType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                >
                  <option value="BLACKLIST">BLACKLIST (Deny Entry)</option>
                  <option value="WHITELIST">WHITELIST (Auto Grant)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Target Entity Value *</label>
                <Input
                  value={entityValue}
                  onChange={(e) => setEntityValue(e.target.value)}
                  placeholder="Vehicle Number or Phone Number..."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Security Reason</label>
                <Input value={ruleReason} onChange={(e) => setRuleReason(e.target.value)} placeholder="Reason for restriction..." />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsRuleModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Save Access Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
