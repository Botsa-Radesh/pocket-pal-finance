import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, Home, Camera, ClipboardList, BarChart3, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/components/beauty/Dashboard";
import SkinAnalysis from "@/components/beauty/SkinAnalysis";
import LifestyleQuestionnaire from "@/components/beauty/LifestyleQuestionnaire";
import AnalysisResults from "@/components/beauty/AnalysisResults";
import ExpertDashboard from "@/components/beauty/ExpertDashboard";

type Tab = 'dashboard' | 'analyze' | 'lifestyle' | 'results' | 'expert';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <div className="animate-pulse-glow rounded-full h-14 w-14 bg-gradient-primary mx-auto flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <p className="mt-4 text-muted-foreground">Loading your beauty profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'analyze', label: 'Analyze', icon: Camera },
    { id: 'lifestyle', label: 'Lifestyle', icon: ClipboardList },
    { id: 'results', label: 'Results', icon: BarChart3 },
    { id: 'expert', label: 'Expert', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero bg-gradient-glow bg-no-repeat">
      {/* Header */}
      <header className="border-b border-border glass-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">GlowAI</h1>
                <p className="text-xs text-muted-foreground">Human-AI Beauty Advisor</p>
              </div>
            </div>
            <div className="flex gap-1 items-center">
              {tabs.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={activeTab === id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(id)}
                  className="gap-1.5"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{label}</span>
                </Button>
              ))}
              <div className="w-px h-6 bg-border mx-1" />
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'analyze' && <SkinAnalysis />}
        {activeTab === 'lifestyle' && <LifestyleQuestionnaire />}
        {activeTab === 'results' && <AnalysisResults />}
        {activeTab === 'expert' && <ExpertDashboard />}
      </main>
    </div>
  );
};

export default Index;
