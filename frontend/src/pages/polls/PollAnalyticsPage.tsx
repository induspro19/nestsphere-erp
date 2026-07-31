import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote, ArrowLeft, Users, Building2, Smartphone, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

export const PollAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [benchmarks, setBenchmarks] = useState<any>(null);

  useEffect(() => {
    fetch('/api/polls/super-admin/benchmarks', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => setBenchmarks(data))
      .catch(() => {});
  }, []);

  const SOURCE_DATA = [
    { name: 'Mobile PWA App', value: 64, color: '#10b981' },
    { name: 'QR Code Instant Scan', value: 26, color: '#6366f1' },
    { name: 'Desktop Web', value: 10, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/polls')} className="rounded-xl">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Polls Governance & Turnout Analytics</h1>
          <p className="text-xs text-muted-foreground">Cross-society voting engagement, device source breakdown, and building-wise participation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold font-display">Voting Channel Breakdown</CardTitle>
            <CardDescription className="text-xs">App vs QR Code vs Web engagement</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={SOURCE_DATA} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {SOURCE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs w-full pt-4 border-t text-center">
              {SOURCE_DATA.map((item) => (
                <div key={item.name} className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground">{item.name}</span>
                  <p className="font-bold text-foreground">{item.value}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold font-display">Multi-Society Governance Scorecard</CardTitle>
            <CardDescription className="text-xs">Super Admin comparative engagement benchmarks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {benchmarks?.benchmarks?.map((b: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/30">
                <div>
                  <p className="font-bold">{b.societyName}</p>
                  <p className="text-[10px] text-muted-foreground">Total Polls: {b.totalPollsConducted} | AGM Success: {b.agmQuorumSuccessRate}%</p>
                </div>
                <Badge variant="success" className="text-[10px] font-mono">{b.avgTurnoutPercentage}% Turnout</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
