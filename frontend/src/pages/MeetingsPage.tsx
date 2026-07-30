import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import {
  meetingApi,
  Meeting,
  MeetingMetrics,
  MeetingAgenda,
  MeetingParticipant,
  MeetingResolution,
  MeetingActionItem,
  MeetingTemplate,
} from '../api/meeting.api';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Vote,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  Layers,
  Repeat,
} from 'lucide-react';
import { toast } from 'sonner';

export const MeetingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'meetings' | 'agenda' | 'attendance' | 'resolutions' | 'actions' | 'calendar' | 'templates'>('meetings');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MeetingMetrics | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [templates, setTemplates] = useState<MeetingTemplate[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [search, setSearch] = useState('');
  const [meetingTypeFilter, setMeetingTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);
  const [showAddAgendaModal, setShowAddAgendaModal] = useState(false);
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);
  const [showAddResolutionModal, setShowAddResolutionModal] = useState(false);
  const [showCreateActionModal, setShowCreateActionModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);

  // Form States
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    meetingType: 'COMMITTEE',
    meetingMode: 'PHYSICAL',
    description: '',
    meetingDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:30',
    venue: 'Community Clubhouse Conference Room',
    meetingLink: '',
    meetingPlatform: 'Google Meet',
    meetingPassword: '',
    isRecurring: false,
    recurrenceType: 'NONE',
    requiredQuorum: 5,
    requiresApproval: false,
  });

  const [agendaForm, setAgendaForm] = useState({
    title: '',
    description: '',
    presenter: 'Society Secretary',
    estimatedDuration: 15,
  });

  const [attendanceForm, setAttendanceForm] = useState({
    personId: '',
    role: 'MEMBER',
    invitationStatus: 'ACCEPTED',
    attendanceStatus: 'PRESENT',
    remarks: '',
  });

  const [resolutionForm, setResolutionForm] = useState({
    title: '',
    description: '',
    status: 'VOTING_REQUIRED',
    votingRequired: true,
    votesFor: 0,
    votesAgainst: 0,
    abstained: 0,
  });

  const [actionForm, setActionForm] = useState({
    task: '',
    ownerName: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'MEDIUM',
    completionPercentage: 0,
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    meetingType: 'COMMITTEE',
    estimatedDuration: 60,
  });

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mStats, mData, tData] = await Promise.all([
        meetingApi.getMetrics(),
        meetingApi.getMeetings({
          search,
          meetingType: meetingTypeFilter || undefined,
          meetingStatus: statusFilter || undefined,
        }),
        meetingApi.getTemplates(),
      ]);
      setMetrics(mStats);
      const items = Array.isArray(mData) ? mData : mData?.items || [];
      setMeetings(items);
      setTemplates(Array.isArray(tData) ? tData : []);

      if (items.length > 0 && !selectedMeeting) {
        const details = await meetingApi.getMeetingDetails(items[0].id);
        setSelectedMeeting(details);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load meeting data');
    } finally {
      setLoading(false);
    }
  }, [search, meetingTypeFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectMeeting = async (meeting: Meeting) => {
    try {
      const details = await meetingApi.getMeetingDetails(meeting.id);
      setSelectedMeeting(details);
    } catch (err: any) {
      toast.error('Failed to load meeting details');
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.title || !meetingForm.meetingDate) {
      toast.error('Please fill required fields (Title, Date)');
      return;
    }
    try {
      await meetingApi.createMeeting(meetingForm);
      toast.success('Meeting scheduled successfully!');
      setShowCreateMeetingModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to schedule meeting');
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name) {
      toast.error('Template name is required');
      return;
    }
    try {
      await meetingApi.createTemplate(templateForm);
      toast.success('Meeting template created!');
      setShowCreateTemplateModal(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to create template');
    }
  };

  const handleAddAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;
    try {
      await meetingApi.addAgenda(selectedMeeting.id, agendaForm);
      toast.success('Agenda item added');
      setShowAddAgendaModal(false);
      handleSelectMeeting(selectedMeeting);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add agenda');
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;
    if (!attendanceForm.personId) {
      toast.error('Person ID is required');
      return;
    }
    try {
      await meetingApi.updateParticipant(selectedMeeting.id, attendanceForm);
      toast.success('Attendance updated');
      setShowMarkAttendanceModal(false);
      handleSelectMeeting(selectedMeeting);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update attendance');
    }
  };

  const handleAddResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;
    try {
      await meetingApi.addResolution(selectedMeeting.id, resolutionForm);
      toast.success('Resolution recorded');
      setShowAddResolutionModal(false);
      handleSelectMeeting(selectedMeeting);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to record resolution');
    }
  };

  const handleCreateActionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;
    try {
      await meetingApi.addActionItem(selectedMeeting.id, actionForm);
      toast.success('Action item assigned');
      setShowCreateActionModal(false);
      handleSelectMeeting(selectedMeeting);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to assign action item');
    }
  };

  const handlePublishNotice = async (meetingId: string) => {
    try {
      await meetingApi.publishNotice(meetingId);
      toast.success('Official Meeting Notice published and linked to Document Engine!');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to publish notice');
    }
  };

  const handleExportAttendance = async (meetingId: string) => {
    try {
      const data = await meetingApi.exportAttendance(meetingId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Attendance_${data.meetingNumber}.json`;
      a.click();
      toast.success('Attendance report exported!');
    } catch (err: any) {
      toast.error('Failed to export attendance');
    }
  };

  const handleExportMinutes = async (meetingId: string) => {
    try {
      const data = await meetingApi.exportMinutes(meetingId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MoM_${data.meetingNumber}.json`;
      a.click();
      toast.success('Minutes of Meeting (MoM) report exported!');
    } catch (err: any) {
      toast.error('Failed to export MoM report');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Scheduled</Badge>;
      case 'ONGOING':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse">Ongoing</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Completed</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'AGM':
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">AGM</Badge>;
      case 'SGM':
        return <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">SGM</Badge>;
      case 'COMMITTEE':
        return <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20">Committee</Badge>;
      case 'EMERGENCY':
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Emergency</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Meeting Ref',
      accessorKey: (row: Meeting) => <span className="font-mono font-bold text-xs">{row.meetingNumber}</span>,
    },
    {
      header: 'Title',
      accessorKey: (row: Meeting) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.title}</span>
          {row.isRecurring && (
            <span className="text-[10px] text-primary flex items-center gap-1 mt-0.5">
              <Repeat className="h-3 w-3" /> Recurrent ({row.recurrenceType})
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Type',
      accessorKey: (row: Meeting) => getTypeBadge(row.meetingType),
    },
    {
      header: 'Date & Time',
      accessorKey: (row: Meeting) => (
        <div className="flex flex-col text-xs">
          <span>{new Date(row.meetingDate).toLocaleDateString()}</span>
          <span className="text-muted-foreground">{row.startTime} - {row.endTime}</span>
        </div>
      ),
    },
    {
      header: 'Mode & Join',
      accessorKey: (row: Meeting) => (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1">
            {row.meetingMode === 'ONLINE' || row.meetingMode === 'HYBRID' ? (
              <Video className="h-3.5 w-3.5 text-sky-500" />
            ) : (
              <MapPin className="h-3.5 w-3.5 text-amber-500" />
            )}
            <span className="truncate max-w-[140px]">{row.meetingMode === 'ONLINE' ? row.meetingPlatform || 'Online' : row.venue}</span>
          </div>
          {(row.meetingLink || row.meetingUrl) && (
            <a
              href={row.meetingLink || row.meetingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
            >
              Join Meeting <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: (row: Meeting) => getStatusBadge(row.meetingStatus),
    },
    {
      header: 'Quorum',
      accessorKey: (row: Meeting) => (
        <Badge variant={row.isQuorumAchieved ? 'default' : 'secondary'} className="text-[10px]">
          {row.achievedQuorum} / {row.requiredQuorum} {row.isQuorumAchieved ? '✓ Achieved' : 'Pending'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessorKey: (row: Meeting) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => handleSelectMeeting(row)}>
            View
          </Button>
          {!row.noticePublished && (
            <Button size="sm" variant="outline" className="text-[10px] h-7 px-2" onClick={() => handlePublishNotice(row.id)}>
              Publish Notice
            </Button>
          )}
          <Button size="sm" variant="outline" className="text-[10px] h-7 px-2" onClick={() => handleExportMinutes(row.id)}>
            Export MoM
          </Button>
        </div>
      ),
    },
  ];

  if (loading && meetings.length === 0) {
    return <LoadingSpinner message="Loading Enterprise Meeting Management Engine..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Enterprise Meeting Management Engine
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            AGM, SGM, Committee Meetings, Online Conferencing, Quorum Engine & Templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCreateTemplateModal(true)} className="gap-1.5 text-xs">
            <Layers className="h-4 w-4" /> Create Template
          </Button>
          <Button onClick={() => setShowCreateMeetingModal(true)} className="gap-2 shadow-md">
            <Plus className="h-4 w-4" /> Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Upcoming Meetings" value={metrics?.upcomingMeetings || 0} icon={CalendarIcon} description="Scheduled & Active" />
        <StatCard title="Meetings This Year" value={metrics?.meetingsHeldThisYear || 0} icon={Clock} description={`${metrics?.meetingsThisMonth || 0} This Month`} />
        <StatCard title="Avg Attendance Rate" value={`${metrics?.averageAttendancePercentage || 0}%`} icon={UserCheck} description="Across All Meetings" />
        <StatCard title="Resolution Pass Rate" value={`${metrics?.resolutionPassRate || 0}%`} icon={Vote} description={`${metrics?.openActionItems || 0} Open Actions`} />
      </div>

      {/* 7 Tabs Header */}
      <div className="flex items-center border-b border-border/60 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('meetings')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'meetings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CalendarIcon className="h-4 w-4" /> Meetings ({meetings.length})
        </button>
        <button
          onClick={() => setActiveTab('agenda')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'agenda' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" /> Agendas ({selectedMeeting?.agendas?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'attendance' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserCheck className="h-4 w-4" /> Participants ({selectedMeeting?.participants?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('resolutions')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'resolutions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Vote className="h-4 w-4" /> Resolutions ({selectedMeeting?.resolutions?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'actions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckSquare className="h-4 w-4" /> Action Items ({selectedMeeting?.actionItems?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'calendar' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CalendarIcon className="h-4 w-4" /> 📅 Calendar
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'templates' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="h-4 w-4" /> Templates ({templates.length})
        </button>
      </div>

      {/* TAB 1: MEETINGS */}
      {activeTab === 'meetings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/40">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search meeting title, ref, venue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={meetingTypeFilter}
                onChange={(e) => setMeetingTypeFilter(e.target.value)}
                className="h-9 text-xs px-3 rounded-lg border border-input bg-background"
              >
                <option value="">All Types</option>
                <option value="AGM">AGM</option>
                <option value="SGM">SGM</option>
                <option value="COMMITTEE">Committee</option>
                <option value="EMERGENCY">Emergency</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs px-3 rounded-lg border border-input bg-background"
              >
                <option value="">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <DataTable columns={columns} data={meetings} />
        </div>
      )}

      {/* TAB 2: AGENDAS */}
      {activeTab === 'agenda' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border/40">
            <div>
              <h3 className="font-bold text-sm font-display">Meeting Agendas: {selectedMeeting?.title}</h3>
              <p className="text-xs text-muted-foreground">Discussion sequence & presenters</p>
            </div>
            <Button size="sm" onClick={() => setShowAddAgendaModal(true)} className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add Agenda Item
            </Button>
          </div>

          {selectedMeeting?.agendas && selectedMeeting.agendas.length > 0 ? (
            <div className="space-y-3">
              {selectedMeeting.agendas.map((agenda) => (
                <div key={agenda.id} className="p-4 rounded-xl bg-card border border-border/40 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="h-7 w-7 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      #{agenda.sequence}
                    </span>
                    <div>
                      <h4 className="font-semibold text-sm">{agenda.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{agenda.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2">
                        <span>Presenter: <strong>{agenda.presenter || 'Unassigned'}</strong></span>
                        <span>•</span>
                        <span>Duration: <strong>{agenda.estimatedDuration} mins</strong></span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                    {agenda.agendaNumber}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/40 text-xs">
              No agenda items added for this meeting yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border/40">
            <div>
              <h3 className="font-bold text-sm font-display">Participants & Quorum Engine</h3>
              <p className="text-xs text-muted-foreground">
                Quorum Status: {selectedMeeting?.achievedQuorum || 0} / {selectedMeeting?.requiredQuorum || 5} (
                {selectedMeeting?.isQuorumAchieved ? '✓ Quorum Achieved' : '⚠️ Pending Quorum'})
              </p>
            </div>
            <Button size="sm" onClick={() => setShowMarkAttendanceModal(true)} className="gap-1.5 text-xs">
              <UserCheck className="h-3.5 w-3.5" /> Mark Attendance
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedMeeting?.participants && selectedMeeting.participants.length > 0 ? (
              selectedMeeting.participants.map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl bg-card border border-border/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">
                      {p.person ? `${p.person.firstName} ${p.person.lastName}` : 'Member'}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {p.role}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/20">
                    <span className="text-muted-foreground text-[11px]">Invitation: {p.invitationStatus}</span>
                    <Badge
                      className={
                        p.attendanceStatus === 'PRESENT'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : p.attendanceStatus === 'ABSENT'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }
                    >
                      {p.attendanceStatus}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/40 text-xs">
                No participants registered for this meeting.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RESOLUTIONS */}
      {activeTab === 'resolutions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border/40">
            <div>
              <h3 className="font-bold text-sm font-display">Meeting Resolutions & Voting Engine</h3>
              <p className="text-xs text-muted-foreground">Passed resolutions and voting tallies</p>
            </div>
            <Button size="sm" onClick={() => setShowAddResolutionModal(true)} className="gap-1.5 text-xs">
              <Vote className="h-3.5 w-3.5" /> Record Resolution
            </Button>
          </div>

          {selectedMeeting?.resolutions && selectedMeeting.resolutions.length > 0 ? (
            <div className="space-y-3">
              {selectedMeeting.resolutions.map((res) => (
                <div key={res.id} className="p-4 rounded-xl bg-card border border-border/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{res.resolutionNumber}</span>
                    <Badge
                      className={
                        res.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : res.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }
                    >
                      {res.status}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-sm">{res.title}</h4>
                  <p className="text-xs text-muted-foreground">{res.description}</p>
                  <div className="flex items-center gap-4 text-xs pt-2 border-t border-border/20">
                    <span className="text-emerald-500 font-semibold">Votes For: {res.votesFor}</span>
                    <span className="text-rose-500 font-semibold">Votes Against: {res.votesAgainst}</span>
                    <span className="text-muted-foreground">Abstained: {res.abstained}</span>
                    <span className="ml-auto font-bold text-primary">Pass Rate: {Number(res.passedByPercentage).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/40 text-xs">
              No resolutions recorded.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ACTION ITEMS */}
      {activeTab === 'actions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border/40">
            <div>
              <h3 className="font-bold text-sm font-display">Action Items & Tasks</h3>
              <p className="text-xs text-muted-foreground">Action items assigned during meeting</p>
            </div>
            <Button size="sm" onClick={() => setShowCreateActionModal(true)} className="gap-1.5 text-xs">
              <CheckSquare className="h-3.5 w-3.5" /> Create Action Item
            </Button>
          </div>

          {selectedMeeting?.actionItems && selectedMeeting.actionItems.length > 0 ? (
            <div className="space-y-3">
              {selectedMeeting.actionItems.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-card border border-border/40 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">{item.task}</h4>
                    <p className="text-xs text-muted-foreground">
                      Assignee: <strong>{item.ownerName || item.owner?.firstName || 'Unassigned'}</strong> • Due:{' '}
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No Deadline'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline" className="text-[10px]">
                      {item.priority}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {item.status} ({item.completionPercentage}%)
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/40 text-xs">
              No action items recorded.
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="p-6 bg-card rounded-xl border border-border/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm font-display flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" /> Monthly Meeting Schedule
            </h3>
            <span className="text-xs font-semibold text-muted-foreground">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground pb-2 border-b border-border/40">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = (i % 31) + 1;
              const hasMeeting = meetings.some((m) => new Date(m.meetingDate).getDate() === dayNum);
              return (
                <div
                  key={i}
                  className={`h-16 p-1.5 rounded-lg border text-[11px] flex flex-col justify-between transition-all ${
                    hasMeeting ? 'bg-primary/5 border-primary/30 font-bold' : 'bg-card/50 border-border/20 text-muted-foreground'
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasMeeting && <span className="h-2 w-2 rounded-full bg-primary self-end" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: MEETING TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border/40">
            <div>
              <h3 className="font-bold text-sm font-display">Reusable Meeting Templates</h3>
              <p className="text-xs text-muted-foreground">Pre-configured agenda templates for quick meeting creation</p>
            </div>
            <Button size="sm" onClick={() => setShowCreateTemplateModal(true)} className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.length > 0 ? (
              templates.map((tpl) => (
                <div key={tpl.id} className="p-4 rounded-xl bg-card border border-border/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm font-display">{tpl.name}</h4>
                    <Badge variant="outline" className="text-[10px]">
                      {tpl.meetingType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Est. Duration: {tpl.estimatedDuration} mins</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => {
                      setMeetingForm({ ...meetingForm, title: `${tpl.name}`, meetingType: tpl.meetingType });
                      setShowCreateMeetingModal(true);
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/40 text-xs">
                No meeting templates created yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE MEETING MODAL */}
      {showCreateMeetingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg font-display">Schedule Enterprise Meeting</h3>
            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <div>
                <label className="text-xs font-semibold">Title *</label>
                <Input value={meetingForm.title} onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Type</label>
                  <select
                    value={meetingForm.meetingType}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingType: e.target.value })}
                    className="w-full h-9 text-xs px-3 rounded-lg border border-input bg-background"
                  >
                    <option value="AGM">AGM</option>
                    <option value="SGM">SGM</option>
                    <option value="COMMITTEE">Committee</option>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="VIRTUAL">Virtual</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold">Mode</label>
                  <select
                    value={meetingForm.meetingMode}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingMode: e.target.value })}
                    className="w-full h-9 text-xs px-3 rounded-lg border border-input bg-background"
                  >
                    <option value="PHYSICAL">Physical</option>
                    <option value="ONLINE">Online</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>
              {(meetingForm.meetingMode === 'ONLINE' || meetingForm.meetingMode === 'HYBRID') && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-accent/30 border border-border/30">
                  <div>
                    <label className="text-xs font-semibold">Platform</label>
                    <Input value={meetingForm.meetingPlatform} onChange={(e) => setMeetingForm({ ...meetingForm, meetingPlatform: e.target.value })} placeholder="Google Meet / Zoom" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Meeting Link</label>
                    <Input value={meetingForm.meetingLink} onChange={(e) => setMeetingForm({ ...meetingForm, meetingLink: e.target.value })} placeholder="https://meet.google.com/..." />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold">Date</label>
                  <Input type="date" value={meetingForm.meetingDate} onChange={(e) => setMeetingForm({ ...meetingForm, meetingDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Start Time</label>
                  <Input type="time" value={meetingForm.startTime} onChange={(e) => setMeetingForm({ ...meetingForm, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold">End Time</label>
                  <Input type="time" value={meetingForm.endTime} onChange={(e) => setMeetingForm({ ...meetingForm, endTime: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input type="checkbox" checked={meetingForm.isRecurring} onChange={(e) => setMeetingForm({ ...meetingForm, isRecurring: e.target.checked })} /> Recurring Meeting
                </label>
                {meetingForm.isRecurring && (
                  <select
                    value={meetingForm.recurrenceType}
                    onChange={(e) => setMeetingForm({ ...meetingForm, recurrenceType: e.target.value })}
                    className="h-8 text-xs px-2 rounded border bg-background"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowCreateMeetingModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Schedule</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TEMPLATE MODAL */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg font-display">Create Meeting Template</h3>
            <form onSubmit={handleCreateTemplate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold">Template Name *</label>
                <Input value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} required placeholder="e.g. Monthly Committee Review" />
              </div>
              <div>
                <label className="text-xs font-semibold">Meeting Type</label>
                <select
                  value={templateForm.meetingType}
                  onChange={(e) => setTemplateForm({ ...templateForm, meetingType: e.target.value })}
                  className="w-full h-9 text-xs px-3 rounded-lg border border-input bg-background"
                >
                  <option value="COMMITTEE">Committee</option>
                  <option value="AGM">AGM</option>
                  <option value="SGM">SGM</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold">Estimated Duration (Mins)</label>
                <Input type="number" value={templateForm.estimatedDuration} onChange={(e) => setTemplateForm({ ...templateForm, estimatedDuration: Number(e.target.value) })} />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowCreateTemplateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Template</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD AGENDA MODAL */}
      {showAddAgendaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg font-display">Add Agenda Item</h3>
            <form onSubmit={handleAddAgenda} className="space-y-3">
              <div>
                <label className="text-xs font-semibold">Agenda Title *</label>
                <Input value={agendaForm.title} onChange={(e) => setAgendaForm({ ...agendaForm, title: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-semibold">Presenter</label>
                <Input value={agendaForm.presenter} onChange={(e) => setAgendaForm({ ...agendaForm, presenter: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold">Estimated Duration (Mins)</label>
                <Input type="number" value={agendaForm.estimatedDuration} onChange={(e) => setAgendaForm({ ...agendaForm, estimatedDuration: Number(e.target.value) })} />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowAddAgendaModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Agenda</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MARK ATTENDANCE MODAL */}
      {showMarkAttendanceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg font-display">Mark Participant Attendance</h3>
            <form onSubmit={handleMarkAttendance} className="space-y-3">
              <div>
                <label className="text-xs font-semibold">Person ID (UUID) *</label>
                <Input value={attendanceForm.personId} onChange={(e) => setAttendanceForm({ ...attendanceForm, personId: e.target.value })} required placeholder="Enter Person UUID" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Role</label>
                  <select
                    value={attendanceForm.role}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, role: e.target.value })}
                    className="w-full h-9 text-xs px-3 rounded-lg border border-input bg-background"
                  >
                    <option value="CHAIRPERSON">Chairperson</option>
                    <option value="SECRETARY">Secretary</option>
                    <option value="MEMBER">Member</option>
                    <option value="GUEST">Guest</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold">Attendance Status</label>
                  <select
                    value={attendanceForm.attendanceStatus}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, attendanceStatus: e.target.value })}
                    className="w-full h-9 text-xs px-3 rounded-lg border border-input bg-background"
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">Late</option>
                    <option value="EXCUSED">Excused</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowMarkAttendanceModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Attendance</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD RESOLUTION MODAL */}
      {showAddResolutionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg font-display">Record Resolution</h3>
            <form onSubmit={handleAddResolution} className="space-y-3">
              <div>
                <label className="text-xs font-semibold">Title *</label>
                <Input value={resolutionForm.title} onChange={(e) => setResolutionForm({ ...resolutionForm, title: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-semibold">Description</label>
                <Input value={resolutionForm.description} onChange={(e) => setResolutionForm({ ...resolutionForm, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold">For</label>
                  <Input type="number" value={resolutionForm.votesFor} onChange={(e) => setResolutionForm({ ...resolutionForm, votesFor: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Against</label>
                  <Input type="number" value={resolutionForm.votesAgainst} onChange={(e) => setResolutionForm({ ...resolutionForm, votesAgainst: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Abstain</label>
                  <Input type="number" value={resolutionForm.abstained} onChange={(e) => setResolutionForm({ ...resolutionForm, abstained: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowAddResolutionModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Record Resolution</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ACTION ITEM MODAL */}
      {showCreateActionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg font-display">Create Action Item</h3>
            <form onSubmit={handleCreateActionItem} className="space-y-3">
              <div>
                <label className="text-xs font-semibold">Task *</label>
                <Input value={actionForm.task} onChange={(e) => setActionForm({ ...actionForm, task: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-semibold">Assignee Name</label>
                <Input value={actionForm.ownerName} onChange={(e) => setActionForm({ ...actionForm, ownerName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Due Date</label>
                  <Input type="date" value={actionForm.dueDate} onChange={(e) => setActionForm({ ...actionForm, dueDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Priority</label>
                  <select
                    value={actionForm.priority}
                    onChange={(e) => setActionForm({ ...actionForm, priority: e.target.value })}
                    className="w-full h-9 text-xs px-3 rounded-lg border border-input bg-background"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowCreateActionModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Assign Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
