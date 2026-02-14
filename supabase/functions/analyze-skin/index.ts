import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, analysisType, lifestyleData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert dermatologist and trichologist AI assistant specializing in skin and hair analysis. Analyze the provided ${analysisType} image and return a detailed JSON analysis.

Your response MUST be valid JSON with this exact structure:
{
  "conditions": [
    {
      "name": "condition name (e.g., Mild Acne, Dryness, Hyperpigmentation, Oily T-Zone, Hair Damage)",
      "severity": "mild|moderate|severe",
      "area": "specific area affected",
      "description": "brief clinical description"
    }
  ],
  "severity_scores": {
    "hydration": 0-100,
    "elasticity": 0-100,
    "clarity": 0-100,
    "texture": 0-100,
    "overall_health": 0-100
  },
  "confidence": 0.0-1.0,
  "skin_type": "oily|dry|combination|normal|sensitive",
  "recommendations": [
    {
      "category": "Cleanser|Moisturizer|Serum|Sunscreen|Treatment|Hair Care",
      "concern": "specific concern addressed",
      "reasoning": "detailed explanation of WHY this is needed based on detected conditions and lifestyle",
      "formulation_type": "e.g., gel-based, cream-based, oil-free, sulfate-free",
      "suggested_ingredients": ["ingredient1", "ingredient2"],
      "avoid_ingredients": ["ingredient1", "ingredient2"],
      "product_suggestions": [
        {"name": "Product Name", "brand": "Brand", "why": "reason"}
      ],
      "priority": 1-5
    }
  ],
  "environmental_factors": "analysis of how lifestyle/environment affects the conditions"
}

${lifestyleData ? `User lifestyle data: ${JSON.stringify(lifestyleData)}. Factor this into your analysis and recommendations.` : ''}

Be thorough, scientific, and transparent in your reasoning. Explain the WHY behind each recommendation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: `Please analyze this ${analysisType} image and provide a comprehensive assessment with personalized recommendations.` },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse JSON from the response (handle markdown code blocks)
    let analysisResult;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) || content.match(/```\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      analysisResult = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
      throw new Error("Failed to parse analysis results");
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-skin error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Analysis failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
