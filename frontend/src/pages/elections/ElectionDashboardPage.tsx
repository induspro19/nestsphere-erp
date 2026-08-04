import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { StatCard } from '../../components/shared/StatCard';
import { EnterprisePageHeader } from '../../components/shared/EnterprisePageHeader';
import { Vote, Users, PlusCircle, BarChart3, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ElectionDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>({ activeElections: 0, registeredCandidates: 0, averageTurnout: 0, committeesFormed: 0 });
  const [activeElections, setActiveElections] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/elections', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setActiveElections(data.data || []);
        setStats({
          activeElections: data.data?.length || 0,
          registeredCandidates: 24,
          averageTurnout: 68,
          committeesFormed: 5
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <EnterprisePageHeader
        icon={Vote}
        title="Enterprise Election & Committee Management Engine"
        description="Manage society elections, candidate nominations, voting channels, committee formations, and automated election results."
        actions={[
          {
            label: 'Create Election',
            onClick: () => navigate('/elections/create'),
            icon: PlusCircle,
            variant: 'default',
          },
          {
            label: 'View Committee',
            onClick: () => navigate('/elections/committee'),
            icon: Users,
            variant: 'outline',
          },
          {
            label: 'View Results',
            onClick: () => navigate('/elections/results'),
            icon: BarChart3,
            variant: 'outline',
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Active Elections" value={stats.activeElections} icon={Vote} />
        <StatCard title="Registered Candidates" value={stats.registeredCandidates} icon={Users} />
        <StatCard title="Average Turnout" value={`${stats.averageTurnout}%`} icon={BarChart3} />
        <StatCard title="Committees Formed" value={stats.committeesFormed} icon={CheckCircle2} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Elections</h2>
        {activeElections.map((election: any) => (
          <Card key={election.id}>
            <CardHeader>
              <CardTitle>{election.title}</CardTitle>
              <CardDescription>Status: {election.status} | Positions: {election.positions?.length || 0} | Candidates: {election.candidates?.length || 0}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: '50%' }}></div>
              </div>
              <p className="text-sm mt-2">Progress: 50% | Turnout Gauge: {election.turnout || 0}% | Quorum: {election.quorum || 0}%</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
