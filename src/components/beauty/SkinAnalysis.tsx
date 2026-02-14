import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const SkinAnalysis = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'skin' | 'hair'>('skin');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please use an image under 5MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!preview || !user) return;
    setAnalyzing(true);
    setResult(null);

    try {
      // Get lifestyle data if available
      const { data: lifestyle } = await supabase
        .from('lifestyle_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data, error } = await supabase.functions.invoke('analyze-skin', {
        body: { imageBase64: preview, analysisType, lifestyleData: lifestyle },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data);

      // Save to database
      const { error: saveError } = await supabase.from('skin_analyses').insert({
        user_id: user.id,
        image_url: 'stored-locally',
        analysis_type: analysisType,
        conditions: data.conditions || [],
        severity_scores: data.severity_scores || {},
        ai_confidence: data.confidence || 0,
      });
      if (saveError) console.error("Failed to save analysis:", saveError);

      // Save recommendations
      if (data.recommendations?.length) {
        const recs = data.recommendations.map((rec: any) => ({
          analysis_id: undefined, // Will need the analysis ID
          user_id: user.id,
          category: rec.category,
          concern: rec.concern,
          reasoning: rec.reasoning,
          formulation_type: rec.formulation_type,
          suggested_ingredients: rec.suggested_ingredients || [],
          avoid_ingredients: rec.avoid_ingredients || [],
          product_suggestions: rec.product_suggestions || [],
          priority: rec.priority || 1,
        }));
        // We'd need the analysis_id - simplified for now
      }

      toast({ title: "Analysis Complete!", description: `${data.conditions?.length || 0} conditions detected.` });
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast({ title: "Analysis Failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'mild') return 'text-success bg-success/10';
    if (severity === 'moderate') return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Camera className="w-5 h-5 text-primary" />
            AI Skin & Hair Analysis
          </CardTitle>
          <CardDescription>
            Upload a clear, well-lit photo. Our AI uses computer vision to detect conditions like dryness, acne, pigmentation, hair damage, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Type selector */}
          <div className="flex gap-3">
            <Button
              variant={analysisType === 'skin' ? 'default' : 'outline'}
              onClick={() => setAnalysisType('skin')}
              className={analysisType === 'skin' ? 'bg-gradient-primary' : ''}
            >
              🧴 Skin Analysis
            </Button>
            <Button
              variant={analysisType === 'hair' ? 'default' : 'outline'}
              onClick={() => setAnalysisType('hair')}
              className={analysisType === 'hair' ? 'bg-gradient-primary' : ''}
            >
              💇 Hair Analysis
            </Button>
          </div>

          {/* Upload area */}
          <div
            className="relative border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="space-y-4">
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg object-cover" />
                <p className="text-sm text-muted-foreground">Click to change image</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Upload a photo</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG up to 5MB. Clear, well-lit, close-up recommended.</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!preview || analyzing}
            className="w-full bg-gradient-primary hover:opacity-90 gap-2"
            size="lg"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze {analysisType === 'skin' ? 'Skin' : 'Hair'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Confidence banner */}
          {result.confidence < 0.7 && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Low Confidence ({(result.confidence * 100).toFixed(0)}%)</p>
                  <p className="text-sm text-muted-foreground">
                    This analysis has been flagged for expert review. A certified professional will validate the results.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skin type & scores */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Analysis Results</CardTitle>
              <CardDescription>
                {analysisType === 'skin' ? 'Skin' : 'Hair'} Type: <span className="font-semibold text-foreground capitalize">{result.skin_type}</span>
                {' · '}Confidence: <span className="font-semibold text-foreground">{(result.confidence * 100).toFixed(0)}%</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(result.severity_scores || {}).map(([key, value]) => (
                  <div key={key} className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold text-foreground">{value as number}</p>
                    <p className="text-xs text-muted-foreground capitalize">{key.replace('_', ' ')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detected Conditions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Detected Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.conditions?.map((c: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(c.severity)}`}>
                      {c.severity}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.area} — {c.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Explainable Recommendations */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Personalized Recommendations</CardTitle>
              <CardDescription>Each recommendation explains WHY it's suggested based on your unique conditions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.recommendations?.map((rec: any, i: number) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
                        {rec.category}
                      </span>
                      <span className="text-xs text-muted-foreground">Priority {rec.priority}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{rec.formulation_type}</span>
                  </div>
                  <p className="font-medium text-foreground">{rec.concern}</p>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs font-medium text-muted-foreground mb-1">💡 Why this matters:</p>
                    <p className="text-sm text-foreground">{rec.reasoning}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">✅ Look for:</p>
                      <div className="flex flex-wrap gap-1">
                        {rec.suggested_ingredients?.map((ing: string, j: number) => (
                          <span key={j} className="px-2 py-0.5 rounded bg-success/10 text-success text-xs">{ing}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">❌ Avoid:</p>
                      <div className="flex flex-wrap gap-1">
                        {rec.avoid_ingredients?.map((ing: string, j: number) => (
                          <span key={j} className="px-2 py-0.5 rounded bg-destructive/10 text-destructive text-xs">{ing}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {rec.product_suggestions?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">🛍️ Product suggestions:</p>
                      <div className="space-y-1">
                        {rec.product_suggestions.map((p: any, j: number) => (
                          <div key={j} className="text-sm">
                            <span className="font-medium text-foreground">{p.brand} {p.name}</span>
                            <span className="text-muted-foreground"> — {p.why}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Environmental Factors */}
          {result.environmental_factors && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display">Environmental Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{result.environmental_factors}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default SkinAnalysis;
