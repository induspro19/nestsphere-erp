import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, AlertTriangle, CheckCircle2, TrendingUp, Zap, ArrowRight, ShieldAlert, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export const AiInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/ai-insights', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setInsights(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleApplyAction = (title: string) => {
    toast.success(`Action applied: ${title}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" /> AI Predictive Analytics & Insights
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Machine Learning forecasting, anomaly detection, confidence scores, and automated executive decision summaries
          </p>
        </div>
      </div>

      {/* Executive Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights?.automatedExecutiveSummaries?.map((sum: any, idx: number) => (
          <Card key={idx} className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Bot className="h-4 w-4" /> {sum.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="text-muted-foreground">{sum.summary}</p>
              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
                <span className="font-semibold text-amber-800 dark:text-amber-300">Action: {sum.actionNeeded}</span>
                <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-lg border-amber-500/40 text-amber-700 hover:bg-amber-500/10" onClick={() => handleApplyAction(sum.title)}>
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Predictions Feed */}
      <div className="space-y-4">
        <h2 className="text-base font-bold font-display flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-500" /> Real-Time ML Predictions
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {insights?.predictions?.map((pred: any) => (
            <Card key={pred.id} className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {pred.category}
                    </Badge>
                    <Badge variant={pred.riskLevel === 'LOW' ? 'success' : pred.riskLevel === 'MEDIUM' ? 'secondary' : 'destructive'} className="text-[10px]">
                      {pred.riskLevel} RISK
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold font-display pt-1">{pred.title}</h3>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground">Confidence</span>
                  <span className="text-lg font-bold font-mono text-emerald-500">{pred.confidenceScore}%</span>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border/40 text-xs space-y-1">
                <p className="font-bold text-foreground">{pred.prediction}</p>
                <p className="text-muted-foreground">{pred.reasoning}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>Recommendation: <strong>{pred.recommendation}</strong></span>
                </div>
                <Button size="sm" onClick={() => handleApplyAction(pred.title)} className="gap-1 text-xs rounded-xl shadow-sm">
                  Execute <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
