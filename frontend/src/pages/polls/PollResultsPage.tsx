import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vote, ArrowLeft, Download, CheckCircle2, ShieldCheck, Lock, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';

export const PollResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/polls/${id}/results`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleExportCsv = () => {
    window.open(`/api/polls/${id}/export-csv`, '_blank');
    toast.success('Downloading Poll Results CSV...');
  };

  const chartData = (data?.breakdown || []).map((b: any) => ({
    name: b.text,
    votes: b.voteCount,
    pct: b.percentage,
  }));

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1', '#8b5cf6'];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/polls')} className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight">{data?.title || 'Decision Results'}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Live Quorum verification and option breakdown</p>
          </div>
        </div>

        <Button onClick={handleExportCsv} className="rounded-xl gap-1.5 text-xs shadow-sm">
          <FileSpreadsheet className="h-4 w-4" /> Export CSV / Audit
        </Button>
      </div>

      {/* Quorum Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Votes Cast</p>
              <h2 className="text-2xl font-bold font-mono">{data?.totalVotes || 0}</h2>
            </div>
            <Badge variant="outline" className="text-xs">{data?.turnoutPercentage}% Turnout</Badge>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Quorum Status</p>
              <h2 className="text-xl font-bold text-emerald-600 font-display flex items-center gap-1.5 pt-0.5">
                <CheckCircle2 className="h-5 w-5" /> {data?.quorumMet ? 'QUORUM MET' : 'PENDING QUORUM'}
              </h2>
            </div>
            <Badge variant="success" className="text-[10px]">{data?.quorumPercentage}% Required</Badge>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Leading Resolution Option</p>
              <h2 className="text-lg font-bold text-amber-600 truncate max-w-[180px]">{data?.leadingChoice || 'N/A'}</h2>
            </div>
            {data?.isSecretBallot && (
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600">
                <Lock className="h-3 w-3 mr-1" /> Secret Ballot
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold font-display">Voting Distribution Breakdown</CardTitle>
          <CardDescription className="text-xs">Real-time breakdown of votes cast by residents & owners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33333320" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="votes" radius={[6, 6, 0, 0]} name="Votes">
                  {chartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 pt-6 border-t">
            {data?.breakdown?.map((item: any, idx: number) => (
              <div key={item.id} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span>{item.text} ({item.description})</span>
                  <span className="font-bold">{item.voteCount} votes ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
