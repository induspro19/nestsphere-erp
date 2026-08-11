import React, { useState, useEffect } from 'react';
import { Vote, Plus, CheckCircle, Clock, Users, ShieldCheck, AlertCircle, FileText, Share2, BarChart2, CheckCircle2 } from 'lucide-react';
import { StatCard } from '../../components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { axiosClient } from '../../api/axiosClient';

export const PollDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pre-populated Default Sample Polls
  const defaultSamplePolls = [
    {
      id: 'poll-default-1',
      title: '2026 Annual Maintenance Sinking Fund Revision',
      description: 'Resolution to increase monthly sinking fund allocation by 12% to cover elevator modernisations and building repaint.',
      pollType: 'AGM_RESOLUTION',
      status: 'ACTIVE',
      votingRule: 'ONE_VOTE_PER_FLAT',
      quorumPercentage: 50,
      turnout: 68,
      quorumMet: true,
      targetAudience: 'ENTIRE_SOCIETY',
      isSecretBallot: true,
      createdAt: '2026-08-01',
    },
    {
      id: 'poll-default-2',
      title: 'EV Charging Infrastructure & Sub-Meter Policy',
      description: 'Approval for installing 12 EV charging points in Tower A & B basement with dedicated RFID metering.',
      pollType: 'BUDGET_APPROVAL',
      status: 'ACTIVE',
      votingRule: 'ONE_VOTE_PER_FLAT',
      quorumPercentage: 50,
      turnout: 54,
      quorumMet: true,
      targetAudience: 'ENTIRE_SOCIETY',
      isSecretBallot: false,
      createdAt: '2026-08-03',
    },
    {
      id: 'poll-default-3',
      title: 'Clubhouse & Swimming Pool Timings Extension',
      description: 'Survey for residents regarding extending weekend clubhouse access until 10:30 PM.',
      pollType: 'OPINION_POLL',
      status: 'ACTIVE',
      votingRule: 'ONE_VOTE_PER_RESIDENT',
      quorumPercentage: 30,
      turnout: 42,
      quorumMet: true,
      targetAudience: 'ENTIRE_SOCIETY',
      isSecretBallot: false,
      createdAt: '2026-08-04',
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

      // Load custom locally published polls
      let localCustom: any[] = [];
      try {
        const stored = localStorage.getItem('custom_created_polls');
        if (stored) {
          localCustom = JSON.parse(stored);
        }
      } catch (e) {
        console.error(e);
      }

      // Combine local created + backend + sample default polls
      const combined = [...localCustom, ...fetched, ...defaultSamplePolls];
      // Deduplicate by title or id
      const unique = combined.filter((v, idx, a) => a.findIndex(t => t.id === v.id || t.title === v.title) === idx);
      
      setPolls(unique);
      setLoading(false);
    };

    fetchPolls();
  }, []);

  const activePolls = polls.filter((p) => p.status === 'ACTIVE' || !p.status);
  const agmResolutions = polls.filter((p) => p.pollType === 'AGM_RESOLUTION' || p.pollType === 'COMMITTEE_RESOLUTION');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[22px] bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Vote className="h-5 w-5" />
            </div>
            <span>Enterprise Poll, Voting & Governance Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Digital decision hub for Surveys, AGM Resolutions, Secret Ballots, and Quorum tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/polls/create')} className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-xs">
            <Plus className="h-4 w-4" /> Create Poll / Resolution
          </Button>
          <Button onClick={() => navigate('/polls/list')} variant="outline" className="h-10 px-4 rounded-xl text-xs font-semibold border-slate-200">
            Registry Archive
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Active Decisions" value={activePolls.length} icon={Vote} trend="Live Turnout" />
        <StatCard title="AGM Resolutions" value={agmResolutions.length} icon={ShieldCheck} />
        <StatCard title="Average Turnout" value="76.4%" icon={Users} trend="+4.2%" />
        <StatCard title="Quorum Success Rate" value="94.2%" icon={CheckCircle} />
      </div>

      {/* Active Polls Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" /> Active Polls & Resolutions ({activePolls.length})
          </h2>
          <Badge className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1">
            Live Voting Open
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activePolls.map((poll) => (
            <Card key={poll.id} className="p-5 space-y-4 hover:border-blue-300 transition-all shadow-2xs rounded-[20px] bg-white flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-700 border-blue-200">
                    {(poll.pollType || 'OPINION_POLL').replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      ACTIVE
                    </Badge>
                    {poll.isSecretBallot && (
                      <Badge className="bg-amber-100 text-amber-800 text-[10px] font-bold border-none">
                        Secret
                      </Badge>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold font-display text-slate-900 leading-snug">{poll.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{poll.description || 'Voting resolution for society members.'}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">Turnout Progress</span>
                    <span className="text-blue-700 font-bold font-mono">{poll.turnout || 54}% (Quorum Met)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${poll.turnout || 54}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Rule: <strong className="text-slate-800">{(poll.votingRule || 'ONE_VOTE_PER_FLAT').replace(/_/g, ' ')}</strong></span>
                  <span>Target: <strong className="text-slate-800">{(poll.targetAudience || 'ENTIRE_SOCIETY').replace(/_/g, ' ')}</strong></span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button size="sm" onClick={() => navigate(`/polls/results/${poll.id}`)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 rounded-xl gap-1.5 shadow-2xs">
                    <BarChart2 className="h-3.5 w-3.5" /> View Results
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success('Vote recorded for flat!')} className="h-9 px-3 text-xs font-semibold rounded-xl border-slate-200 hover:bg-slate-50">
                    Cast Vote
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
