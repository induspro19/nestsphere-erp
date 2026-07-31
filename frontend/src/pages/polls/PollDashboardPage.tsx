import React, { useState, useEffect } from 'react';
import { Vote, Plus, CheckCircle, Clock, Users, ShieldCheck, AlertCircle, FileText, Share2, BarChart2 } from 'lucide-react';
import { StatCard } from '../../components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const PollDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/polls', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPolls(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activePolls = polls.filter((p) => p.status === 'ACTIVE');
  const agmResolutions = polls.filter((p) => p.pollType === 'AGM_RESOLUTION');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <Vote className="h-6 w-6 text-primary" /> Enterprise Poll, Voting & Governance Engine
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Digital decision hub for Surveys, AGM Resolutions, Secret Ballots, and Quorum tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/polls/create')} className="rounded-xl gap-2 text-xs shadow-sm">
            <Plus className="h-4 w-4" /> Create Poll / Resolution
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
        <h2 className="text-base font-bold font-display flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" /> Active Polls & Resolutions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activePolls.map((poll) => (
            <Card key={poll.id} className="p-5 space-y-4 hover:border-primary/40 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono uppercase">
                      {poll.pollType}
                    </Badge>
                    <Badge variant={poll.status === 'ACTIVE' ? 'success' : 'secondary'} className="text-[10px]">
                      {poll.status}
                    </Badge>
                    {poll.isSecretBallot && (
                      <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                        Secret Ballot
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-base font-bold font-display pt-1">{poll.title}</h3>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{poll.description}</p>

              <div className="space-y-1.5 pt-2 border-t text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Turnout & Quorum Progress</span>
                  <span className="text-primary font-bold">54% (Quorum Met)</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '54%' }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-muted-foreground text-[10px]">
                  Rule: <strong>{poll.votingRule}</strong>
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/polls/results/${poll.id}`)} className="rounded-xl text-xs gap-1.5">
                    <BarChart2 className="h-3.5 w-3.5" /> View Results
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
