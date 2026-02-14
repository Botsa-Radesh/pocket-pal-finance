import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Droplets, Sun, Wind, Sparkles, ArrowRight, Activity, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DashboardProps {
  onNavigate: (tab: 'dashboard' | 'analyze' | 'lifestyle' | 'results' | 'expert') => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { user } = useAuth();
  const [analysisCount, setAnalysisCount] = useState(0);
  const [hasLifestyle, setHasLifestyle] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const [{ count }, { data: lifestyle }, { data: latest }] = await Promise.all([
      supabase.from('skin_analyses').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('lifestyle_profiles').select('id').eq('user_id', user!.id).maybeSingle(),
      supabase.from('skin_analyses').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    setAnalysisCount(count || 0);
    setHasLifestyle(!!lifestyle);
    setLatestAnalysis(latest);
  };

  const features = [
    {
      icon: Camera,
      title: "AI Skin & Hair Analysis",
      description: "Upload a photo for instant AI-powered condition detection using computer vision.",
      action: () => onNavigate('analyze'),
      cta: "Start Analysis",
    },
    {
      icon: Droplets,
      title: "Lifestyle Assessment",
      description: "Tell us about your habits, environment, and routine for personalized insights.",
      action: () => onNavigate('lifestyle'),
      cta: hasLifestyle ? "Update Profile" : "Complete Profile",
    },
    {
      icon: Brain,
      title: "Explainable Recommendations",
      description: "Understand WHY each product is suggested with transparent reasoning.",
      action: () => onNavigate('results'),
      cta: "View Results",
    },
    {
      icon: Activity,
      title: "Expert Validation",
      description: "Low-confidence predictions reviewed by certified beauty professionals.",
      action: () => onNavigate('expert'),
      cta: "Expert Panel",
    },
  ];

  const healthScores = latestAnalysis?.severity_scores as Record<string, number> | null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 md:p-12 text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-glow opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Human-AI Collaborative Platform</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
            Your Personalized Beauty Journey
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mb-6">
            Combining AI precision with human expertise to deliver safe, transparent, and personalized skincare & haircare recommendations.
          </p>
          <Button
            onClick={() => onNavigate('analyze')}
            variant="secondary"
            size="lg"
            className="gap-2"
          >
            <Camera className="w-4 h-4" />
            Analyze My Skin
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card hover-lift">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{analysisCount}</p>
              <p className="text-xs text-muted-foreground">Analyses Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card hover-lift">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Sun className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{healthScores?.overall_health ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Skin Health Score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card hover-lift">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Wind className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{hasLifestyle ? '✓' : '—'}</p>
              <p className="text-xs text-muted-foreground">Lifestyle Profile</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <Card key={i} className="shadow-card hover-lift cursor-pointer group" onClick={f.action}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 group-hover:shadow-glow transition-shadow">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                    <CardDescription className="mt-1">{f.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="gap-2 text-primary">
                  {f.cta}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
