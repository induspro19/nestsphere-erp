import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const ElectionAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/elections/super-admin/benchmarks', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const d = await res.json();
        setData({
          channels: [
            { name: 'App', value: 400 },
            { name: 'QR', value: 300 },
            { name: 'Web', value: 300 }
          ],
          scorecards: [
            { society: 'Society A', engagement: 85 },
            { society: 'Society B', engagement: 72 }
          ]
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <h1 className="text-3xl font-display font-bold">Election Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Voting Channel Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.channels} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                    {data.channels.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Society Engagement Scorecard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.scorecards.map((s: any, i: number) => (
                <div key={i} className="flex justify-between items-center">
                  <span>{s.society}</span>
                  <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${s.engagement}%` }}></div>
                  </div>
                  <span>{s.engagement}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
