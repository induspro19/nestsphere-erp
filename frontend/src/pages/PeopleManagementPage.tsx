import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import { peopleApi, Person } from '../api/people.api';
import {
  Users,
  Search,
  UserPlus,
  QrCode,
  ShieldCheck,
  Smartphone,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  X,
} from 'lucide-react';

export const PeopleManagementPage: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedKyc, setSelectedKyc] = useState('');

  // Add Person Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // Form inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<string[]>(['OWNER']);
  const [identityType, setIdentityType] = useState('Aadhaar');
  const [identityNumber, setIdentityNumber] = useState('');

  const allRoleCategories = [
    'OWNER',
    'TENANT',
    'FAMILY_MEMBER',
    'COMMITTEE_MEMBER',
    'SECURITY_GUARD',
    'MAINTENANCE_STAFF',
    'VENDOR',
    'DRIVER',
    'COOK',
    'HOUSE_MAID',
    'GARDENER',
    'ELECTRICIAN',
    'PLUMBER',
    'DELIVERY_PARTNER',
    'PROPERTY_MANAGER',
    'WATCHMAN',
  ];

  useEffect(() => {
    fetchPeople();
  }, [search, selectedRole, selectedKyc]);

  const fetchPeople = async () => {
    setIsLoading(true);
    try {
      const res = await peopleApi.getPeople({
        search,
        role: selectedRole || undefined,
        kycStatus: selectedKyc || undefined,
      });
      setPeople(res.data);
      setTotal(res.meta.total);
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await peopleApi.createPerson({
        firstName,
        lastName,
        phone,
        email: email || undefined,
        roles,
        identityType,
        identityNumber,
        isAttendanceReady: true,
        isVisitorReady: true,
      });
      setIsAddModalOpen(false);
      resetForm();
      fetchPeople();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create person');
    }
  };

  const handleExport = async () => {
    try {
      const data = await peopleApi.exportPeople();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `People_Directory_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch {
      alert('Failed to export dataset');
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setRoles(['OWNER']);
    setIdentityNumber('');
  };

  const toggleRoleSelection = (role: string) => {
    if (roles.includes(role)) {
      if (roles.length > 1) setRoles(roles.filter((r) => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };

  const columns = [
    {
      header: 'Person & Digital ID',
      accessorKey: (row: Person) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
            {row.firstName[0]}
          </div>
          <div>
            <p className="font-semibold text-sm leading-none">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">{row.digitalId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      accessorKey: (row: Person) => (
        <div className="text-xs space-y-0.5">
          <p className="font-medium text-foreground">{row.phone}</p>
          {row.email && <p className="text-muted-foreground">{row.email}</p>}
        </div>
      ),
    },
    {
      header: 'Assigned Roles',
      accessorKey: (row: Person) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.roles.map((r) => (
            <Badge key={r.id} variant="secondary" className="text-[10px] px-2 py-0.5">
              {r.roleCode.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'KYC & Verification',
      accessorKey: (row: Person) => {
        if (row.kycStatus === 'VERIFIED') {
          return (
            <Badge variant="success" className="gap-1 text-[10px]">
              <CheckCircle className="h-3 w-3" /> VERIFIED
            </Badge>
          );
        }
        if (row.kycStatus === 'REJECTED') {
          return (
            <Badge variant="destructive" className="gap-1 text-[10px]">
              <XCircle className="h-3 w-3" /> REJECTED
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="gap-1 text-[10px] text-amber-600 border-amber-500/30">
            <Clock className="h-3 w-3" /> PENDING
          </Badge>
        );
      },
    },
    {
      header: 'Hardware Readiness',
      accessorKey: (row: Person) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {row.digitalIdQrToken && (
            <span title="QR Ready">
              <QrCode className="h-4 w-4 text-emerald-500" />
            </span>
          )}
          {row.isFaceRecognitionReady && (
            <span title="Face Recognition Ready">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
            </span>
          )}
          {row.isMobileAppReady && (
            <span title="Mobile App Active">
              <Smartphone className="h-4 w-4 text-sky-500" />
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessorKey: (row: Person) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedPerson(row)}
          className="rounded-lg h-8 px-2 text-xs"
        >
          View Profile
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-border/40 bg-gradient-to-r from-card via-accent/30 to-background flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Master People Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Single Person master entity supporting multi-role tagging & multi-unit occupancy
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} className="rounded-xl">
            <Download className="h-4 w-4 mr-2" /> Export Dataset
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl">
            <UserPlus className="h-4 w-4 mr-2" /> Add Person Profile
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Registered People" value={total} description="Master Entity Count" icon={Users} />
        <StatCard title="Multi-Role Coverage" value="16 Roles" description="Owner, Maid, Guard, Vendor, etc." icon={ShieldCheck} />
        <StatCard title="Digital ID Generated" value={total} description="QR Access Enabled" icon={QrCode} />
        <StatCard title="Hardware Integration" value="Attendance Ready" description="Face & Mobile Ready" icon={Smartphone} />
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or Digital ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Roles (16 Categories)</option>
              {allRoleCategories.map((r) => (
                <option key={r} value={r}>
                  {r.replace('_', ' ')}
                </option>
              ))}
            </select>

            <select
              value={selectedKyc}
              onChange={(e) => setSelectedKyc(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All KYC Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {isLoading ? (
        <LoadingSpinner message="Querying Master People Registry..." />
      ) : (
        <DataTable columns={columns} data={people} emptyMessage="No person profiles match your search criteria." />
      )}

      {/* Modal: Add Person Profile */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Add Person Profile</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreatePerson} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">First Name *</label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Last Name *</label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Phone Number *</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Assign Roles (Multi-Select)</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-input rounded-xl bg-accent/20">
                  {allRoleCategories.map((r) => {
                    const isSelected = roles.includes(r);
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => toggleRoleSelection(r)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-background hover:bg-accent text-muted-foreground'
                        }`}
                      >
                        {r.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Identity Document</label>
                  <select
                    value={identityType}
                    onChange={(e) => setIdentityType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">ID Number</label>
                  <Input value={identityNumber} onChange={(e) => setIdentityNumber(e.target.value)} placeholder="ABCD123456" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Create Master Person Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Person Profile Details */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Digital ID Card</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedPerson(null)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center">
                    {selectedPerson.firstName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-base">{selectedPerson.firstName} {selectedPerson.lastName}</h4>
                    <p className="text-xs text-muted-foreground font-mono">{selectedPerson.digitalId}</p>
                  </div>
                </div>
                <QrCode className="h-8 w-8 text-primary" />
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{selectedPerson.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">KYC Status</span>
                  <span className="font-medium text-emerald-500">{selectedPerson.kycStatus}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Assigned Roles</span>
                  <span className="font-medium">
                    {selectedPerson.roles.map((r) => r.roleCode.replace('_', ' ')).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedPerson(null)} className="rounded-xl">
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
