import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import {
  noticeApi,
  Notice,
  NoticeMetrics,
  NoticeTemplate,
} from '../api/notice.api';
import {
  Bell,
  Plus,
  Search,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  Layers,
  CheckSquare,
  BarChart2,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

export const NoticeBoardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notices' | 'pending' | 'detail' | 'emergency' | 'templates' | 'analytics'>('notices');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<NoticeMetrics | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [templates, setTemplates] = useState<NoticeTemplate[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals
  const [showCreateNoticeModal, setShowCreateNoticeModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);

  // Form States
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    requiresApproval: false,
    requiresAcknowledgement: false,
    targetType: 'ENTIRE_SOCIETY',
  });

  const [templateForm, setTemplateForm] = useState({
    templateName: '',
    category: 'GENERAL',
    title: '',
    description: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [nStats, nData, tData] = await Promise.all([
        noticeApi.getMetrics(),
        noticeApi.getNotices({
          search,
          category: categoryFilter || undefined,
          priority: priorityFilter || undefined,
        }),
        noticeApi.getTemplates(),
      ]);
      setMetrics(nStats);
      const items = Array.isArray(nData) ? nData : nData?.items || [];
      setNotices(items);
      setTemplates(Array.isArray(tData) ? tData : []);

      if (items.length > 0 && !selectedNotice) {
        const details = await noticeApi.getNoticeDetails(items[0].id);
        setSelectedNotice(details);
      }
    } catch (err: any) {
      toast.error('Failed to load Notice Board data');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, priorityFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectNotice = async (notice: Notice) => {
    try {
      const details = await noticeApi.getNoticeDetails(notice.id);
      setSelectedNotice(details);
      setActiveTab('detail');
    } catch (err: any) {
      toast.error('Failed to load notice details');
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.description) {
      toast.error('Title and Description are required');
      return;
    }
    try {
      await noticeApi.createNotice(noticeForm);
      toast.success('Notice published successfully!');
      setShowCreateNoticeModal(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to create notice');
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.templateName || !templateForm.title) {
      toast.error('Template Name and Title are required');
      return;
    }
    try {
      await noticeApi.createTemplate(templateForm);
      toast.success('Notice template created!');
      setShowCreateTemplateModal(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to create template');
    }
  };

  const handleApproveNotice = async (id: string) => {
    try {
      await noticeApi.approveNotice(id);
      toast.success('Notice approved and published!');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to approve notice');
    }
  };

  const handleAcknowledgeNotice = async (id: string) => {
    try {
      await noticeApi.acknowledgeNotice(id);
      toast.success('Notice read & acknowledged!');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to acknowledge notice');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'EMERGENCY':
      case 'CRITICAL':
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold animate-pulse">Critical Emergency</Badge>;
      case 'HIGH':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">High Priority</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20">Medium</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Published</Badge>;
      case 'PENDING_APPROVAL':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending Approval</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-muted/50 text-muted-foreground">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Notice Ref',
      accessorKey: (row: Notice) => <span className="font-mono font-bold text-xs">{row.noticeNumber}</span>,
    },
    {
      header: 'Title',
      accessorKey: (row: Notice) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.title}</span>
          <span className="text-[11px] text-muted-foreground truncate max-w-[280px]">{row.description}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: (row: Notice) => <Badge variant="outline" className="text-[10px]">{row.category}</Badge>,
    },
    {
      header: 'Priority',
      accessorKey: (row: Notice) => getPriorityBadge(row.priority),
    },
    {
      header: 'Status',
      accessorKey: (row: Notice) => getStatusBadge(row.status),
    },
    {
      header: 'Published Date',
      accessorKey: (row: Notice) => (
        <span className="text-xs text-muted-foreground">
          {row.publishDate ? new Date(row.publishDate).toLocaleDateString() : 'Draft'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessorKey: (row: Notice) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => handleSelectNotice(row)}>
            View
          </Button>
          {row.status === 'PENDING_APPROVAL' && (
            <Button size="sm" variant="outline" className="text-[10px] h-7 px-2" onClick={() => handleApproveNotice(row.id)}>
              Approve
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading && notices.length === 0) {
    return <LoadingSpinner message="Loading Enterprise Notice Board Engine..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Enterprise Notice Board Engine
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Digital Notice Board, Emergency Alerts, Audience Targeting & Acknowledgements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCreateTemplateModal(true)} className="gap-1.5 text-xs">
            <Layers className="h-4 w-4" /> Create Template
          </Button>
          <Button onClick={() => setShowCreateNoticeModal(true)} className="gap-2 shadow-md">
            <Plus className="h-4 w-4" /> Publish Notice
          </Button>
        </div>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Notices" value={metrics?.activeNotices || 0} icon={Bell} description="Published & Visible" />
        <StatCard title="Pending Approval" value={metrics?.pendingApproval || 0} icon={Clock} description="Awaiting Admin Review" />
        <StatCard title="Emergency Alerts" value={metrics?.criticalNotices || 0} icon={ShieldAlert} description="High / Critical Alerts" />
        <StatCard title="Avg Acknowledgement Rate" value={`${metrics?.acknowledgementRate || 100}%`} icon={CheckSquare} description="Resident Read Rate" />
      </div>

      {/* 6 Tabs Header */}
      <div className="flex items-center border-b border-border/60 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'notices' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bell className="h-4 w-4" /> Notices ({notices.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="h-4 w-4" /> Pending Approval ({notices.filter((n) => n.status === 'PENDING_APPROVAL').length})
        </button>
        <button
          onClick={() => setActiveTab('detail')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'detail' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" /> Notice Profile & Acknowledgements
        </button>
        <button
          onClick={() => setActiveTab('emergency')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'emergency' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShieldAlert className="h-4 w-4" /> 🚨 Emergency Notices
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'templates' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="h-4 w-4" /> Notice Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analytics' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart2 className="h-4 w-4" /> Analytics & Category Breakdown
        </button>
      </div>

      {/* TAB 1: NOTICES TABLE */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/40">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search title, notice ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 text-xs px-3 rounded-lg border border-input bg-background"
              >
                <option value="">All Categories</option>
                <option value="GENERAL">General</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="WATER">Water</option>
                <option value="ELECTRICITY">Electricity</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-9 text-xs px-3 rounded-lg border border-input bg-background"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <DataTable columns={columns} data={notices} />
        </div>
      )}

      {/* TAB 2: PENDING APPROVAL QUEUE */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="p-4 bg-card rounded-xl border border-border/40 space-y-1">
            <h3 className="font-bold text-sm font-display">Approval Queue</h3>
            <p className="text-xs text-muted-foreground">Notices requiring administrator review before publishing</p>
          </div>

          <div className="space-y-3">
            {notices.filter((n) => n.status === 'PENDING_APPROVAL').length > 0 ? (
              notices
                .filter((n) => n.status === 'PENDING_APPROVAL')
                .map((n) => (
                  <div key={n.id} className="p-4 rounded-xl bg-card border border-border/40 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-primary">{n.noticeNumber}</span>
                        <h4 className="font-semibold text-sm">{n.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{n.description}</p>
                    </div>
                    <Button size="sm" onClick={() => handleApproveNotice(n.id)} className="gap-1 text-xs shrink-0">
                      <Check className="h-3.5 w-3.5" /> Approve & Publish
                    </Button>
                  </div>
                ))
            ) : (
              <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/40 text-xs">
                No notices pending approval.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NOTICE PROFILE & ACKNOWLEDGEMENTS */}
      {activeTab === 'detail' && (
        <div className="space-y-4">
          {selectedNotice ? (
            <div className="p-6 bg-card rounded-xl border border-border/40 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div>
                  <span className="font-mono text-xs font-bold text-primary">{selectedNotice.noticeNumber}</span>
                  <h2 className="text-xl font-bold font-display">{selectedNotice.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{selectedNotice.category}</Badge>
                    {getPriorityBadge(selectedNotice.priority)}
                    {getStatusBadge(selectedNotice.status)}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleAcknowledgeNotice(selectedNotice.id)} className="gap-1.5 text-xs">
                  <CheckSquare className="h-4 w-4" /> Acknowledge Read
                </Button>
              </div>

              <div>
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">Notice Description</h4>
                <p className="text-sm text-foreground bg-accent/30 p-4 rounded-xl border border-border/30 whitespace-pre-wrap">
                  {selectedNotice.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Audience Acknowledgement Breakdown ({selectedNotice.recipients?.length || 0} Recipients)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedNotice.recipients && selectedNotice.recipients.length > 0 ? (
                    selectedNotice.recipients.map((r) => (
                      <div key={r.id} className="p-3 rounded-lg bg-card border border-border/30 flex items-center justify-between">
                        <span className="text-xs font-medium">{r.person ? `${r.person.firstName} ${r.person.lastName}` : 'Resident'}</span>
                        <Badge
                          variant={r.acknowledgementStatus === 'ACKNOWLEDGED' ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {r.acknowledgementStatus}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-xs text-muted-foreground">All society residents automatically targeted.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/40 text-xs">
              Select a notice to view detail profile.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EMERGENCY ALERTS */}
      {activeTab === 'emergency' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Emergency Alert Broadcast System</h3>
              <p className="text-xs opacity-90">Emergency and critical priority notices requiring immediate resident action</p>
            </div>
          </div>

          <div className="space-y-3">
            {notices.filter((n) => n.priority === 'CRITICAL' || n.priority === 'EMERGENCY').length > 0 ? (
              notices
                .filter((n) => n.priority === 'CRITICAL' || n.priority === 'EMERGENCY')
                .map((n) => (
                  <div key={n.id} className="p-4 rounded-xl bg-card border border-rose-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-rose-500">{n.noticeNumber}</span>
                      {getPriorityBadge(n.priority)}
                    </div>
                    <h4 className="font-bold text-sm text-foreground">{n.title}</h4>
                    <p className="text-xs text-muted-foreground">{n.description}</p>
                  </div>
                ))
            ) : (
              <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/40 text-xs">
                No emergency alerts active.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border/40">
            <div>
              <h3 className="font-bold text-sm font-display">Notice Templates</h3>
              <p className="text-xs text-muted-foreground">Pre-configured notice content for recurring society updates</p>
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
                    <h4 className="font-bold text-sm font-display">{tpl.templateName}</h4>
                    <Badge variant="outline" className="text-[10px]">{tpl.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{tpl.title}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => {
                      setNoticeForm({ ...noticeForm, title: tpl.title, description: tpl.description, category: tpl.category });
                      setShowCreateNoticeModal(true);
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/40 text-xs">
                No templates created yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="p-6 bg-card rounded-xl border border-border/40 space-y-4">
          <h3 className="font-bold text-sm font-display flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" /> Category & Priority Distribution
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
              <span className="text-2xl font-bold text-primary">{notices.filter((n) => n.category === 'MAINTENANCE').length}</span>
              <p className="text-xs text-muted-foreground mt-1">Maintenance</p>
            </div>
            <div className="p-4 rounded-lg bg-sky-500/5 border border-sky-500/20 text-center">
              <span className="text-2xl font-bold text-sky-500">{notices.filter((n) => n.category === 'WATER' || n.category === 'ELECTRICITY').length}</span>
              <p className="text-xs text-muted-foreground mt-1">Utilities</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
              <span className="text-2xl font-bold text-amber-500">{notices.filter((n) => n.category === 'SECURITY').length}</span>
              <p className="text-xs text-muted-foreground mt-1">Security</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
              <span className="text-2xl font-bold text-emerald-500">{notices.filter((n) => n.category === 'GENERAL').length}</span>
              <p className="text-xs text-muted-foreground mt-1">General</p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NOTICE MODAL */}
      {showCreateNoticeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg font-display">Publish Society Notice</h3>
            <form onSubmit={handleCreateNotice} className="space-y-3">
              <div>
                <label className="text-xs font-semibold">Title *</label>
                <Input value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Category</label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                    className="w-full h-9 text-xs px-3 rounded-lg border border-input bg-background"
                  >
                    <option value="GENERAL">General</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="WATER">Water</option>
                    <option value="ELECTRICITY">Electricity</option>
                    <option value="SECURITY">Security</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold">Priority</label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                    className="w-full h-9 text-xs px-3 rounded-lg border border-input bg-background"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold">Description *</label>
                <textarea
                  rows={4}
                  value={noticeForm.description}
                  onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })}
                  className="w-full p-3 text-xs rounded-lg border border-input bg-background"
                  required
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input type="checkbox" checked={noticeForm.requiresApproval} onChange={(e) => setNoticeForm({ ...noticeForm, requiresApproval: e.target.checked })} /> Require Admin Approval
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input type="checkbox" checked={noticeForm.requiresAcknowledgement} onChange={(e) => setNoticeForm({ ...noticeForm, requiresAcknowledgement: e.target.checked })} /> Require Read Receipt
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowCreateNoticeModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Publish</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TEMPLATE MODAL */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg font-display">Create Notice Template</h3>
            <form onSubmit={handleCreateTemplate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold">Template Name *</label>
                <Input value={templateForm.templateName} onChange={(e) => setTemplateForm({ ...templateForm, templateName: e.target.value })} required placeholder="e.g. Tank Cleaning Alert" />
              </div>
              <div>
                <label className="text-xs font-semibold">Default Title *</label>
                <Input value={templateForm.title} onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-semibold">Default Content *</label>
                <textarea
                  rows={3}
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-lg border border-input bg-background"
                  required
                />
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
    </div>
  );
};
