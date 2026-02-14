import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Loader2, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ExpertDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingAnalyses, setPendingAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchPending();
  }, [user]);

  const fetchPending = async () => {
    // Show user's own low-confidence analyses that haven't been reviewed
    const { data } = await supabase
      .from('skin_analyses')
      .select('*')
      .eq('user_id', user!.id)
      .lt('ai_confidence', 0.7)
      .eq('expert_reviewed', false)
      .order('created_at', { ascending: false });
    setPendingAnalyses(data || []);
    setLoading(false);
  };

  const handleApprove = async (analysisId: string) => {
    setSubmitting(analysisId);
    try {
      await supabase.from('skin_analyses').update({
        expert_reviewed: true,
        expert_notes: reviewNotes[analysisId] || 'Approved by review',
        reviewed_by: user!.id,
      }).eq('id', analysisId);

      await supabase.from('expert_reviews').insert({
        analysis_id: analysisId,
        expert_id: user!.id,
        original_conditions: pendingAnalyses.find(a => a.id === analysisId)?.conditions || [],
        validation_status: 'approved',
        notes: reviewNotes[analysisId] || 'Approved',
      });

      toast({ title: "Review Submitted", description: "Analysis has been approved." });
      fetchPending();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-card bg-gradient-hero border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Shield className="w-5 h-5 text-primary" />
            Human-in-the-Loop Validation
          </CardTitle>
          <CardDescription>
            Low-confidence AI predictions are flagged for expert review. This ensures safety and builds trust in the recommendation system.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingAnalyses.length}</p>
              <p className="text-xs text-muted-foreground">Pending Reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">—</p>
              <p className="text-xs text-muted-foreground">Verified Today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">&lt;70%</p>
              <p className="text-xs text-muted-foreground">Confidence Threshold</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {pendingAnalyses.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-success mb-4" />
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">All Clear!</h3>
            <p className="text-sm text-muted-foreground">No low-confidence analyses awaiting review. All predictions are within acceptable confidence ranges.</p>
          </CardContent>
        </Card>
      ) : (
        pendingAnalyses.map((analysis) => {
          const conditions = (analysis.conditions || []) as any[];
          return (
            <Card key={analysis.id} className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-warning border-warning/30">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {(Number(analysis.ai_confidence) * 100).toFixed(0)}% Confidence
                    </Badge>
                    <Badge variant={analysis.analysis_type === 'skin' ? 'default' : 'secondary'}>
                      {analysis.analysis_type}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Detected Conditions:</p>
                  <div className="flex flex-wrap gap-2">
                    {conditions.map((c: any, i: number) => (
                      <Badge key={i} variant="outline">
                        {c.name} — {c.severity}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Review Notes:</p>
                  <Textarea
                    placeholder="Add your professional notes, corrections, or observations..."
                    value={reviewNotes[analysis.id] || ''}
                    onChange={(e) => setReviewNotes(prev => ({ ...prev, [analysis.id]: e.target.value }))}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(analysis.id)}
                    disabled={submitting === analysis.id}
                    className="bg-gradient-primary hover:opacity-90 gap-2"
                  >
                    {submitting === analysis.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Approve Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* How it works */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">How Expert Validation Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'AI Detection', desc: 'Deep learning models analyze skin/hair images to detect conditions.' },
              { step: '2', title: 'Confidence Check', desc: 'Predictions below 70% confidence are automatically flagged for review.' },
              { step: '3', title: 'Expert Review', desc: 'Certified professionals validate, correct, and approve the analysis. Feedback improves the AI.' },
            ].map((s) => (
              <div key={s.step} className="p-4 rounded-xl bg-muted text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center mx-auto text-sm font-bold">
                  {s.step}
                </div>
                <p className="font-medium text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpertDashboard;
