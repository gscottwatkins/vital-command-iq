/**
 * Anthropic Vision parsing for meals and device metrics
 * Env: ANTHROPIC_API_KEY
 * POST body: { image: "<base64>", mediaType: "image/jpeg|image/png|...", context?: "meal"|"garmin"|"whoop"|"bp"|"cpap"|"withings"|"oura" }
 */
export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "POST only" }) };
    }

    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return { statusCode: 500, body: JSON.stringify({ error: "Missing ANTHROPIC_API_KEY" }) };

    const { image, mediaType, context } = JSON.parse(event.body || "{}");
    if (!image) return { statusCode: 400, body: JSON.stringify({ error: "Missing image" }) };

    const contextPrompts = {
      meal: "This is a meal/food photo. Identify every food item visible.",
      garmin: "This is a Garmin watch/app screenshot. Extract all health metrics visible (steps, calories, heart rate, VO2 max, sleep data, stress, body battery, etc).",
      whoop: "This is a WHOOP app screenshot. Extract recovery score, HRV, resting HR, sleep performance, strain, respiratory rate, and any other visible metrics.",
      bp: "This is a blood pressure reading. Extract systolic, diastolic, and pulse values.",
      cpap: "This is a CPAP/ResMed myAir screenshot. Extract AHI, usage hours, mask fit percentage, leak rate, and any other visible stats.",
      withings: "This is a Withings Body Comp scale or app screenshot. Extract weight, body fat %, muscle mass, visceral fat, bone mass, water %, and ECG/EKG reading if visible.",
      oura: "This is an Oura Ring app screenshot. Extract readiness score, sleep score, activity score, HRV, resting HR, body temperature, respiratory rate, and any other visible metrics.",
    };

    const contextHint = contextPrompts[context] || "Analyze this image — it could be a meal photo or a health device screenshot.";

    const payload = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType || "image/jpeg", data: image }
            },
            {
              type: "text",
              text:
                `${contextHint}\n\n` +
                "Return STRICT JSON only (no markdown, no backticks). Use this schema:\n" +
                '{ "kind": "meal" | "metrics", "source": "garmin" | "whoop" | "cpap" | "withings" | "oura" | "bp_device" | "food_photo" | "unknown", "items": [...] }\n\n' +
                "If kind=meal: items = [{ name, portion, calories, protein_g, carbs_g, fat_g, fiber_g, confidence }]\n" +
                "If kind=metrics: items = [{ metric_name, value, unit, confidence }]\n" +
                "Possible metric_names: weight, body_fat, visceral_fat, muscle_mass, bone_mass, water_pct, hrv, resting_hr, sleep_score, recovery_score, strain, bp_systolic, bp_diastolic, pulse, vo2_max, respiratory_rate, ahi, cpap_hours, mask_fit, leak_rate, steps, calories_burned, active_minutes, body_battery, stress_level, readiness_score, spo2, ecg_status, body_temp_deviation\n" +
                "Set confidence 0.0-1.0. If uncertain about a value, set confidence low. Never fabricate values not visible in the image."
            }
          ]
        }
      ]
    };

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();

    // Try to extract just the JSON from Claude's response
    let parsed = null;
    try {
      const text = data?.content?.[0]?.text || "";
      const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (_) {
      // Leave parsed as null, client will handle raw
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ parsed, raw: data })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || String(e) }) };
  }
}
