import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Loader2, Calendar, Shield, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const AnalysisResults = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAnalyses();
  }, [user]);

  const fetchAnalyses = async () => {
    const { data } = await supabase
      .from('skin_analyses')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setAnalyses(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="max-w-lg mx-auto shadow-card animate-fade-in">
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">No Analyses Yet</h3>
          <p className="text-sm text-muted-foreground">Upload a photo in the Analyze tab to get your first AI-powered skin or hair analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <BarChart3 className="w-5 h-5 text-primary" />
            Analysis History
          </CardTitle>
          <CardDescription>Track your skin & hair health over time. {analyses.length} analysis(es) completed.</CardDescription>
        </CardHeader>
      </Card>

      {analyses.map((a) => {
        const conditions = (a.conditions || []) as any[];
        const scores = (a.severity_scores || {}) as Record<string, number>;
        return (
          <Card key={a.id} className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={a.analysis_type === 'skin' ? 'default' : 'secondary'}>
                    {a.analysis_type === 'skin' ? '🧴 Skin' : '💇 Hair'}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(a.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.expert_reviewed && (
                    <Badge variant="outline" className="gap-1 text-success border-success/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Expert Verified
                    </Badge>
                  )}
                  {!a.expert_reviewed && a.ai_confidence < 0.7 && (
                    <Badge variant="outline" className="gap-1 text-warning border-warning/30">
                      <Shield className="w-3 h-3" />
                      Pending Review
                    </Badge>
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {(Number(a.ai_confidence) * 100).toFixed(0)}% confidence
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Health scores */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(scores).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                      <span className="font-medium text-foreground">{val}</span>
                    </div>
                    <Progress value={val} className="h-2" />
                  </div>
                ))}
              </div>

              {/* Conditions */}
              <div className="flex flex-wrap gap-2">
                {conditions.map((c: any, i: number) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className={
                      c.severity === 'mild' ? 'border-success/30 text-success' :
                      c.severity === 'moderate' ? 'border-warning/30 text-warning' :
                      'border-destructive/30 text-destructive'
                    }
                  >
                    {c.name} ({c.severity})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AnalysisResults;
