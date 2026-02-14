import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ClipboardList, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const LifestyleQuestionnaire = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    sleep_hours: 7,
    water_intake_liters: 2,
    sun_exposure_hours: 1,
    stress_level: 5,
    diet_type: 'balanced',
    exercise_frequency: 'moderate',
    smoking: false,
    alcohol_frequency: 'rarely',
    city: '',
    climate_type: 'temperate',
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('lifestyle_profiles')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();
    if (data) {
      setForm({
        sleep_hours: Number(data.sleep_hours) || 7,
        water_intake_liters: Number(data.water_intake_liters) || 2,
        sun_exposure_hours: Number(data.sun_exposure_hours) || 1,
        stress_level: data.stress_level || 5,
        diet_type: data.diet_type || 'balanced',
        exercise_frequency: data.exercise_frequency || 'moderate',
        smoking: data.smoking || false,
        alcohol_frequency: data.alcohol_frequency || 'rarely',
        city: data.city || '',
        climate_type: data.climate_type || 'temperate',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('lifestyle_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('lifestyle_profiles').update(form).eq('user_id', user.id);
      } else {
        await supabase.from('lifestyle_profiles').insert({ ...form, user_id: user.id });
      }
      toast({ title: "Saved!", description: "Your lifestyle profile has been updated." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <ClipboardList className="w-5 h-5 text-primary" />
            Lifestyle & Environment Profile
          </CardTitle>
          <CardDescription>
            Your habits and environment significantly affect skin & hair health. This data personalizes your recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sleep */}
          <div className="space-y-2">
            <Label>Sleep Hours per Night: {form.sleep_hours}h</Label>
            <Slider
              value={[form.sleep_hours]}
              onValueChange={([v]) => setForm(f => ({ ...f, sleep_hours: v }))}
              min={3} max={12} step={0.5}
            />
          </div>

          {/* Water intake */}
          <div className="space-y-2">
            <Label>Daily Water Intake: {form.water_intake_liters}L</Label>
            <Slider
              value={[form.water_intake_liters]}
              onValueChange={([v]) => setForm(f => ({ ...f, water_intake_liters: v }))}
              min={0.5} max={5} step={0.5}
            />
          </div>

          {/* Sun exposure */}
          <div className="space-y-2">
            <Label>Daily Sun Exposure: {form.sun_exposure_hours}h</Label>
            <Slider
              value={[form.sun_exposure_hours]}
              onValueChange={([v]) => setForm(f => ({ ...f, sun_exposure_hours: v }))}
              min={0} max={10} step={0.5}
            />
          </div>

          {/* Stress level */}
          <div className="space-y-2">
            <Label>Stress Level: {form.stress_level}/10</Label>
            <Slider
              value={[form.stress_level]}
              onValueChange={([v]) => setForm(f => ({ ...f, stress_level: v }))}
              min={1} max={10} step={1}
            />
          </div>

          {/* Diet */}
          <div className="space-y-2">
            <Label>Diet Type</Label>
            <Select value={form.diet_type} onValueChange={v => setForm(f => ({ ...f, diet_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="keto">Keto</SelectItem>
                <SelectItem value="paleo">Paleo</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Exercise */}
          <div className="space-y-2">
            <Label>Exercise Frequency</Label>
            <Select value={form.exercise_frequency} onValueChange={v => setForm(f => ({ ...f, exercise_frequency: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="light">Light (1-2x/week)</SelectItem>
                <SelectItem value="moderate">Moderate (3-4x/week)</SelectItem>
                <SelectItem value="active">Active (5+/week)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Smoking */}
          <div className="flex items-center justify-between">
            <Label>Smoking</Label>
            <Switch checked={form.smoking} onCheckedChange={v => setForm(f => ({ ...f, smoking: v }))} />
          </div>

          {/* Alcohol */}
          <div className="space-y-2">
            <Label>Alcohol Consumption</Label>
            <Select value={form.alcohol_frequency} onValueChange={v => setForm(f => ({ ...f, alcohol_frequency: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="rarely">Rarely</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="frequent">Frequent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              placeholder="e.g., Mumbai, Delhi, Bangalore"
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            />
          </div>

          {/* Climate */}
          <div className="space-y-2">
            <Label>Climate Type</Label>
            <Select value={form.climate_type} onValueChange={v => setForm(f => ({ ...f, climate_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tropical">Tropical (Hot & Humid)</SelectItem>
                <SelectItem value="dry">Dry (Arid)</SelectItem>
                <SelectItem value="temperate">Temperate</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
                <SelectItem value="coastal">Coastal</SelectItem>
                <SelectItem value="polluted_urban">Polluted Urban</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-primary hover:opacity-90 gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LifestyleQuestionnaire;
