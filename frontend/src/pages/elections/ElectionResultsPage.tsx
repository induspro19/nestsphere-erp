import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Crown, Download, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useParams } from 'react-router-dom';

export const ElectionResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/elections/${id}/results`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        // Mock data
        setResults({
          positions: [
            {
              title: 'CHAIRPERSON',
              candidates: [
                { name: 'John Doe', votes: 120, isWinner: true },
                { name: 'Jane Smith', votes: 80, isWinner: false }
              ],
              hasTie: false
            }
          ],
          totalVotes: 200,
          turnout: 85,
          quorumMet: true
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  if (!results) return <div>Loading...</div>;

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <h1 className="text-3xl font-display font-bold">Election Results</h1>
      
      <div className="flex gap-4 mb-6">
        <Badge variant={results.quorumMet ? 'default' : 'destructive'}>Quorum {results.quorumMet ? 'Met' : 'Not Met'}</Badge>
        <Badge>Total Votes: {results.totalVotes}</Badge>
        <Badge>Turnout: {results.turnout}%</Badge>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-2" /> Result Report</Button>
        <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-2" /> Winner Certificate</Button>
        <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-2" /> RO Certificate</Button>
        <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-2" /> Committee Report</Button>
        <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-2" /> Audit Report</Button>
      </div>

      <div className="space-y-6">
        {results.positions.map((pos: any, i: number) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>{pos.title}</CardTitle>
              {pos.hasTie && (
                <div className="flex items-center text-amber-600 bg-amber-50 p-2 rounded mt-2">
                  <AlertTriangle className="w-4 h-4 mr-2" /> TIE DETECTED
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pos.candidates}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="votes">
                      {pos.candidates.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.isWinner ? '#22c55e' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {pos.candidates.map((c: any, j: number) => (
                  <div key={j} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="flex items-center gap-2">
                      {c.name} {c.isWinner && <Crown className="text-yellow-500 w-4 h-4" />}
                    </span>
                    <span>{c.votes} votes</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
