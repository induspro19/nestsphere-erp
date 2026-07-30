import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import { workflowApi, WorkflowInstance, WorkflowTemplate } from '../api/workflow.api';
import {
  GitMerge,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  FileCheck,
  Plus,
  Search,
  Sliders,
  ShieldAlert,
  Send,
  X,
} from 'lucide-react';

export const WorkflowsPage: React.FC = () => {
  const [pendingApprovals, setPendingApprovals] = useState<WorkflowInstance[]>([]);
  const [allWorkflows, setAllWorkflows] = useState<WorkflowInstance[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY' | 'TEMPLATES'>('PENDING');

  // Action Modal State
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null);
  const [actionComments, setActionComments] = useState('');
  const [digitalSignature, setDigitalSignature] = useState('');

  // Start Workflow Modal State
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [entityType, setEntityType] = useState('MOVE_IN');
  const [entityId, setEntityId] = useState('');
  const [workflowTitle, setWorkflowTitle] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pendingRes, allRes, tmplRes] = await Promise.all([
        workflowApi.getPendingApprovals(),
        workflowApi.getWorkflows(),
        workflowApi.getTemplates(),
      ]);
      setPendingApprovals(pendingRes || []);
      setAllWorkflows(allRes.data || []);
      setTemplates(tmplRes || []);
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessAction = async (action: 'APPROVED' | 'REJECTED' | 'RETURNED_FOR_CORRECTION') => {
    if (!selectedWorkflow) return;
    try {
      await workflowApi.processAction(selectedWorkflow.id, {
        action,
        comments: actionComments || undefined,
        signatureHash: digitalSignature || undefined,
      });
      setSelectedWorkflow(null);
      setActionComments('');
      setDigitalSignature('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process workflow action');
    }
  };

  const handleStartWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await workflowApi.startWorkflow({
        entityType,
        entityId: entityId || `ENT-${Date.now()}`,
        title: workflowTitle,
      });
      setIsStartModalOpen(false);
      setWorkflowTitle('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate workflow');
    }
  };

  const entityTypeOptions = [
    'MOVE_IN',
    'MOVE_OUT',
    'VENDOR',
    'STAFF',
    'AMENITY',
    'BILLING',
    'EXPENSE',
    'PURCHASE',
    'DOCUMENT',
    'NOC',
    'SOCIETY_POLL',
    'MEETING',
    'COMPLAINT',
    'VISITOR',
  ];

  const columns = [
    {
      header: 'Workflow Request',
      accessorKey: (row: WorkflowInstance) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{row.title}</span>
            <Badge variant="outline" className="text-[10px]">
              {row.entityType}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">Entity ID: {row.entityId}</p>
        </div>
      ),
    },
    {
      header: 'Approval Progression',
      accessorKey: (row: WorkflowInstance) => (
        <div className="text-xs space-y-1">
          <p className="font-semibold text-foreground">Current Level: Step {row.currentStepNumber}</p>
          <div className="flex items-center gap-1">
            {row.steps.map((s) => (
              <span
                key={s.id}
                title={`${s.stepName} (${s.status})`}
                className={`h-2.5 w-6 rounded-full inline-block ${
                  s.status === 'APPROVED'
                    ? 'bg-emerald-500'
                    : s.status === 'REJECTED'
                    ? 'bg-red-500'
                    : s.stepNumber === row.currentStepNumber
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-accent'
                }`}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      header: 'SLA Status',
      accessorKey: (row: WorkflowInstance) => (
        <div className="text-xs">
          {row.slaDueDate ? (
            <p className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" /> SLA: {new Date(row.slaDueDate).toLocaleDateString()}
            </p>
          ) : (
            <span className="text-muted-foreground">Standard 24h</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: (row: WorkflowInstance) => {
        if (row.status === 'APPROVED') {
          return (
            <Badge variant="success" className="gap-1 text-[10px]">
              <CheckCircle className="h-3 w-3" /> APPROVED
            </Badge>
          );
        }
        if (row.status === 'REJECTED') {
          return (
            <Badge variant="destructive" className="gap-1 text-[10px]">
              <XCircle className="h-3 w-3" /> REJECTED
            </Badge>
          );
        }
        if (row.status === 'RETURNED_FOR_CORRECTION') {
          return (
            <Badge variant="outline" className="gap-1 text-[10px] text-amber-600 border-amber-500/30">
              <RotateCcw className="h-3 w-3" /> RETURNED
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="gap-1 text-[10px] text-sky-600 border-sky-500/30">
            <Clock className="h-3 w-3 text-sky-500" /> PENDING STEP {row.currentStepNumber}
          </Badge>
        );
      },
    },
    {
      header: 'Action',
      accessorKey: (row: WorkflowInstance) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedWorkflow(row)}
          className="rounded-lg h-8 px-2 text-xs"
        >
          Review & Approve
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
            <GitMerge className="h-6 w-6 text-primary" /> Enterprise Workflow & Approval Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generic multi-level approval pipeline for Move In, Vendor Registration, NOC, Expenses & Amenities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsStartModalOpen(true)} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" /> Initiate Workflow
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Pending Approvals" value={pendingApprovals.length} description="Awaiting Your Action" icon={Clock} />
        <StatCard title="Active Templates" value={templates.length} description="14 Module Integrations" icon={Sliders} />
        <StatCard title="Digital Signatures" value="SHA-256 Ready" description="Verifiable Audit Hash" icon={FileCheck} />
        <StatCard title="SLA Timers" value="24 Hours SLA" description="Auto Escalation Engine" icon={ShieldAlert} />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'PENDING' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent/60'
          }`}
        >
          My Pending Approvals ({pendingApprovals.length})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'HISTORY' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent/60'
          }`}
        >
          Workflow Audit History ({allWorkflows.length})
        </button>
        <button
          onClick={() => setActiveTab('TEMPLATES')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'TEMPLATES' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent/60'
          }`}
        >
          Workflow Templates Designer ({templates.length})
        </button>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <LoadingSpinner message="Querying enterprise workflow engine..." />
      ) : activeTab === 'PENDING' ? (
        <DataTable columns={columns} data={pendingApprovals} emptyMessage="Zero pending approvals assigned to your role." />
      ) : activeTab === 'HISTORY' ? (
        <DataTable columns={columns} data={allWorkflows} emptyMessage="No workflow approval records found." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" /> Workflow Template Pipeline Configurator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((tmpl) => (
                <div key={tmpl.id} className="p-4 rounded-xl border border-border/40 bg-accent/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base">{tmpl.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{tmpl.code}</Badge>
                  </div>
                  <div className="text-xs space-y-1.5 border-t border-border/30 pt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entity Module</span>
                      <span className="font-semibold text-primary">{tmpl.entityType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Approval Mode</span>
                      <span className="font-medium">{tmpl.approvalType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SLA Duration</span>
                      <span className="font-medium">{tmpl.slaHours} Hours</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal: Initiate Workflow */}
      {isStartModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Initiate Approval Workflow</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsStartModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleStartWorkflow} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Target Module (14 Categories)</label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                >
                  {entityTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Workflow Title *</label>
                <Input
                  value={workflowTitle}
                  onChange={(e) => setWorkflowTitle(e.target.value)}
                  placeholder="e.g. Move In Request for Flat A-101"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Entity Reference ID</label>
                <Input value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder="FLT-101-REQ" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsStartModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Initiate Approval Chain
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Process Review & Action */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Review Approval Step</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedWorkflow(null)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-1.5 text-xs">
              <h4 className="font-bold text-sm">{selectedWorkflow.title}</h4>
              <p className="text-muted-foreground">Module: {selectedWorkflow.entityType} | Entity ID: {selectedWorkflow.entityId}</p>
              <p className="text-primary font-semibold">Current Step: Level {selectedWorkflow.currentStepNumber}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground uppercase">Approver Comments</label>
                <Input
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  placeholder="Enter comments or reasons for decision..."
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground uppercase">Digital Signature Hash (Optional)</label>
                <Input
                  value={digitalSignature}
                  onChange={(e) => setDigitalSignature(e.target.value)}
                  placeholder="SHA-256 digital signature payload..."
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/40">
              <Button variant="destructive" onClick={() => handleProcessAction('REJECTED')} className="rounded-xl text-xs">
                Reject
              </Button>
              <Button variant="outline" onClick={() => handleProcessAction('RETURNED_FOR_CORRECTION')} className="rounded-xl text-xs">
                Return
              </Button>
              <Button onClick={() => handleProcessAction('APPROVED')} className="rounded-xl text-xs">
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
