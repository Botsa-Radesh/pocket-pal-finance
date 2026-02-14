
-- Create storage bucket for skin/hair analysis images
INSERT INTO storage.buckets (id, name, public) VALUES ('analysis-images', 'analysis-images', false);

-- Storage policies for analysis images
CREATE POLICY "Users can upload their own analysis images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'analysis-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own analysis images"
ON storage.objects FOR SELECT
USING (bucket_id = 'analysis-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own analysis images"
ON storage.objects FOR DELETE
USING (bucket_id = 'analysis-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Skin/Hair analyses table
CREATE TABLE public.skin_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  image_url TEXT NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('skin', 'hair')),
  conditions JSONB NOT NULL DEFAULT '[]',
  severity_scores JSONB NOT NULL DEFAULT '{}',
  ai_confidence NUMERIC(3,2) NOT NULL DEFAULT 0,
  expert_reviewed BOOLEAN NOT NULL DEFAULT false,
  expert_notes TEXT,
  reviewed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.skin_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analyses"
ON public.skin_analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses"
ON public.skin_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
ON public.skin_analyses FOR UPDATE
USING (auth.uid() = user_id);

-- Lifestyle profiles table
CREATE TABLE public.lifestyle_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id),
  sleep_hours NUMERIC(3,1),
  water_intake_liters NUMERIC(3,1),
  sun_exposure_hours NUMERIC(3,1),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  diet_type TEXT,
  exercise_frequency TEXT,
  smoking BOOLEAN DEFAULT false,
  alcohol_frequency TEXT,
  city TEXT,
  climate_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lifestyle_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lifestyle profile"
ON public.lifestyle_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lifestyle profile"
ON public.lifestyle_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lifestyle profile"
ON public.lifestyle_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Recommendations table
CREATE TABLE public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.skin_analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  category TEXT NOT NULL,
  concern TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  formulation_type TEXT NOT NULL,
  suggested_ingredients JSONB NOT NULL DEFAULT '[]',
  avoid_ingredients JSONB NOT NULL DEFAULT '[]',
  product_suggestions JSONB NOT NULL DEFAULT '[]',
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recommendations"
ON public.recommendations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recommendations"
ON public.recommendations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Expert reviews table
CREATE TABLE public.expert_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.skin_analyses(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES public.profiles(id),
  original_conditions JSONB NOT NULL DEFAULT '[]',
  corrected_conditions JSONB,
  validation_status TEXT NOT NULL CHECK (validation_status IN ('pending', 'approved', 'corrected', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experts can view reviews they are assigned"
ON public.expert_reviews FOR SELECT
USING (auth.uid() = expert_id);

CREATE POLICY "Experts can create reviews"
ON public.expert_reviews FOR INSERT
WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Experts can update their reviews"
ON public.expert_reviews FOR UPDATE
USING (auth.uid() = expert_id);

CREATE POLICY "Users can view reviews for their analyses"
ON public.expert_reviews FOR SELECT
USING (auth.uid() IN (
  SELECT user_id FROM public.skin_analyses WHERE id = analysis_id
));

-- Add role to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Triggers for updated_at
CREATE TRIGGER update_skin_analyses_updated_at
BEFORE UPDATE ON public.skin_analyses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lifestyle_profiles_updated_at
BEFORE UPDATE ON public.lifestyle_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
