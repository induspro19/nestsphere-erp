import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DataTable } from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Vote, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ElectionListPage: React.FC = () => {
  const [elections, setElections] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/elections', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setElections(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const filteredElections = filter === 'ALL' ? elections : elections.filter(e => e.status === filter);

  const columns = [
    { header: 'Title', accessorKey: (row: any) => row.title },
    { header: 'Type', accessorKey: (row: any) => <Badge variant="outline">{row.electionType || row.type}</Badge> },
    { header: 'Positions', accessorKey: (row: any) => row.positions?.length || 0 },
    { header: 'Status', accessorKey: (row: any) => <Badge variant={row.status === 'VOTING_OPEN' ? 'success' : 'secondary'}>{row.status}</Badge> },
    { header: 'Actions', accessorKey: (row: any) => <Button size="sm" onClick={() => navigate(`/elections/results/${row.id}`)}><Eye className="w-4 h-4 mr-1" /> View Results</Button> },
  ];

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div className="flex items-center gap-2">
        <Vote className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-display font-bold">Elections</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by Status</CardTitle>
          <div className="flex flex-wrap gap-2">
            {['ALL', 'NOMINATION_OPEN', 'VOTING_OPEN', 'RESULT_DECLARED', 'CERTIFIED', 'ARCHIVED'].map(f => (
              <Button key={f} variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>{f}</Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable data={filteredElections} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
};
