import React, { useState, useEffect } from 'react';
import { Vote, Plus, Search, Filter, ShieldCheck, CheckCircle2, Clock, Eye, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { DataTable } from '../../components/shared/DataTable';
import { useNavigate } from 'react-router-dom';

export const PollListPage: React.FC = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/polls', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => setPolls(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const filteredPolls = filterStatus === 'ALL' ? polls : polls.filter((p) => p.status === filterStatus);

  const tableData = filteredPolls.map((p, idx) => ({ id: p.id || `poll-${idx}`, ...p }));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <Vote className="h-6 w-6 text-primary" /> Polls, Voting & Resolutions Registry
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Complete lifecycle archive of Opinion Polls, AGM Resolutions, and Resident Decision Audits
          </p>
        </div>
        <Button onClick={() => navigate('/polls/create')} className="rounded-xl gap-2 text-xs shadow-sm">
          <Plus className="h-4 w-4" /> Create New Decision
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2 text-xs">
        {['ALL', 'ACTIVE', 'SCHEDULED', 'CLOSED', 'RESULT_PUBLISHED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filterStatus === st ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={[
              { header: 'Title', accessorKey: (row: any) => <span className="font-bold text-foreground">{row.title}</span> },
              { header: 'Type', accessorKey: (row: any) => <Badge variant="outline">{row.pollType}</Badge> },
              { header: 'Target Audience', accessorKey: (row: any) => <span className="text-xs text-muted-foreground">{row.targetAudience}</span> },
              { header: 'Quorum %', accessorKey: (row: any) => `${row.quorumPercentage}%` },
              { header: 'Status', accessorKey: (row: any) => <Badge variant={row.status === 'ACTIVE' ? 'success' : 'secondary'}>{row.status}</Badge> },
              {
                header: 'Actions',
                accessorKey: (row: any) => (
                  <Button size="sm" variant="outline" onClick={() => navigate(`/polls/results/${row.id}`)} className="rounded-xl text-xs gap-1">
                    <BarChart2 className="h-3.5 w-3.5" /> Results
                  </Button>
                ),
              },
            ]}
            data={tableData}
            emptyMessage="No decision polls found."
          />
        </CardContent>
      </Card>
    </div>
  );
};
