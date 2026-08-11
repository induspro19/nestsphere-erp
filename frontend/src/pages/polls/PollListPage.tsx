import React, { useState, useEffect } from 'react';
import { Vote, Plus, Search, Filter, ShieldCheck, CheckCircle2, Clock, Eye, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { DataTable } from '../../components/shared/DataTable';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from '../../api/axiosClient';

export const PollListPage: React.FC = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const defaultSamplePolls = [
    {
      id: 'poll-default-1',
      title: '2026 Annual Maintenance Sinking Fund Revision',
      pollType: 'AGM_RESOLUTION',
      status: 'ACTIVE',
      votingRule: 'ONE_VOTE_PER_FLAT',
      quorumPercentage: 50,
      targetAudience: 'ENTIRE_SOCIETY',
    },
    {
      id: 'poll-default-2',
      title: 'EV Charging Infrastructure & Sub-Meter Policy',
      pollType: 'BUDGET_APPROVAL',
      status: 'ACTIVE',
      votingRule: 'ONE_VOTE_PER_FLAT',
      quorumPercentage: 50,
      targetAudience: 'ENTIRE_SOCIETY',
    },
    {
      id: 'poll-default-3',
      title: 'Clubhouse & Swimming Pool Timings Extension',
      pollType: 'OPINION_POLL',
      status: 'ACTIVE',
      votingRule: 'ONE_VOTE_PER_RESIDENT',
      quorumPercentage: 30,
      targetAudience: 'ENTIRE_SOCIETY',
    },
  ];

  useEffect(() => {
    const fetchPolls = async () => {
      let fetched: any[] = [];
      try {
        const res = await axiosClient.get('/polls');
        if (Array.isArray(res.data)) {
          fetched = res.data;
        } else if (Array.isArray(res.data?.data)) {
          fetched = res.data.data;
        }
      } catch (err) {
        console.log('Polls API fetch note:', err);
      }

      let localCustom: any[] = [];
      try {
        const stored = localStorage.getItem('custom_created_polls');
        if (stored) {
          localCustom = JSON.parse(stored);
        }
      } catch (e) {
        console.error(e);
      }

      const combined = [...localCustom, ...fetched, ...defaultSamplePolls];
      const unique = combined.filter((v, idx, a) => a.findIndex(t => t.id === v.id || t.title === v.title) === idx);

      setPolls(unique);
    };

    fetchPolls();
  }, []);

  const filteredPolls = filterStatus === 'ALL' ? polls : polls.filter((p) => p.status === filterStatus);

  const tableData = filteredPolls.map((p, idx) => ({ id: p.id || `poll-${idx}`, ...p }));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[22px] bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Vote className="h-5 w-5" />
            </div>
            <span>Polls, Voting & Resolutions Registry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete lifecycle archive of Opinion Polls, AGM Resolutions, and Resident Decision Audits
          </p>
        </div>
        <Button onClick={() => navigate('/polls/create')} className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" /> Create New Decision
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs">
        {['ALL', 'ACTIVE', 'SCHEDULED', 'CLOSED', 'RESULT_PUBLISHED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              filterStatus === st ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      <Card className="rounded-[22px] border border-slate-200/90 shadow-xs bg-white">
        <CardContent className="pt-6">
          <DataTable
            columns={[
              { header: 'Title', accessorKey: (row: any) => <span className="font-bold text-slate-900">{row.title}</span> },
              { header: 'Type', accessorKey: (row: any) => <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold">{row.pollType}</Badge> },
              { header: 'Target Audience', accessorKey: (row: any) => <span className="text-xs text-slate-600">{row.targetAudience}</span> },
              { header: 'Quorum %', accessorKey: (row: any) => <span className="font-mono font-bold">{row.quorumPercentage}%</span> },
              { header: 'Status', accessorKey: (row: any) => <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">{row.status || 'ACTIVE'}</Badge> },
              {
                header: 'Actions',
                accessorKey: (row: any) => (
                  <Button size="sm" variant="outline" onClick={() => navigate(`/polls/results/${row.id}`)} className="h-8 rounded-xl text-xs font-semibold gap-1 border-slate-200">
                    <BarChart2 className="h-3.5 w-3.5 text-blue-600" /> Results
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
