// Netlify serverless function. Your OpenAI key lives in an environment variable, never in the page.
// Set in Netlify: Site settings > Environment variables > OPENAI_API_KEY (optional: OPENAI_MODEL)

const ITEMS = {
  anguthi:"ring (anguthi)",
  earrings:"earrings (jhumke / tops)",
  chain:"chain / necklace (haar)",
  pendant:"pendant / locket",
  mangalsutra:"mangalsutra",
  bangles:"bangles / kangan",
  bracelet:"bracelet / kada",
  nath:"nath / nose pin",
  payal:"anklet (payal)",
  bridal:"bridal / wedding jewellery set",
  custom:"custom design order",
  coin:"gold / silver coin",
  utensils:"silver bartan / utensils",
  pooja:"pooja items / murti",
  gift:"gift item"
};
const LIKES = {
  apnapan:"warm family-like hospitality and respect (apnapan)",
  patience:"patiently showed designs without any rush or pushy sales",
  honest:"honest advice and transparent weight & making charges",
  customfit:"understood my taste and budget perfectly",
  design:"latest and beautiful designs with great finish",
  purity:"100% BIS hallmark purity and trusted quality",
  price:"fair and reasonable making charges",
  trust:"generational trust in Murtizapur",
  pack:"lovely gift box and neat packaging"
};
const IMPROVE = {
  wait:"waiting time due to rush",
  price:"would appreciate more discount on making charges",
  variety:"would love to see even more daily wear designs",
  rush:"counter was crowded during peak festival hours"
};
const VISITS = {
  first:"first visit",
  repeat:"trusted family jeweller / regular customer",
  wedding:"wedding / bridal shopping",
  fest:"festival / Dhanteras shopping",
  gift:"bought as a gift"
};
const LANGS = {
  hi:"Hinglish: casual Hindi written in English (Roman) letters, the way people text in India. Natural, friendly, and respectful. Do not use Devanagari",
  mr:"Marathi written in Devanagari script, polite, conversational and warm",
  en:"natural, warm Indian English"
};

const json = (code, obj) => ({statusCode: code, headers: {"Content-Type": "application/json"}, body: JSON.stringify(obj)});
const pickKnown = (arr, map) => (Array.isArray(arr) ? arr : []).filter(k => k in map).slice(0, 8).map(k => map[k]);

exports.handler = async (event) => {
  // Health check / keep-warm ping endpoint
  if (event.httpMethod === "GET") {
    return json(200, {status: "warm", timestamp: Date.now()});
  }

  if (event.httpMethod !== "POST") return json(405, {error: "POST only"});
  if (!process.env.OPENAI_API_KEY) return json(500, {error: "Missing OPENAI_API_KEY"});

  let b;
  try { b = JSON.parse(event.body || "{}"); } catch { return json(400, {error: "Bad JSON"}); }

  const lang = LANGS[b.lang] ? b.lang : "hi";
  const stars = Math.min(5, Math.max(1, parseInt(b.stars, 10) || 5));
  const shop = String(b.shop || "Radhika Jewellers").slice(0, 60);
  const items = pickKnown(b.items, ITEMS);
  const likes = pickKnown(b.likes, LIKES);
  const improve = pickKnown(b.improve, IMPROVE);
  const visit = VISITS[b.visit] || "not specified";
  if (!items.length) return json(400, {error: "No items"});

  const tone = stars >= 4 ? "warm, heartfelt, and genuinely happy"
    : stars === 3 ? "balanced and honest, mildly positive with a gentle mention of what could improve"
    : "honest and polite, clearly not satisfied, no insults";

  const system =
`You help a customer draft a Google review for a trusted local jewellery shop, using ONLY the facts they selected.
Rules:
- Write in ${LANGS[lang]}.
- 2 to 4 short sentences, first person, sounds like a real customer speaking from the heart, never like a corporate ad or robot.
- Highlight the personal human connection, apnapan, and honest treatment if mentioned in the facts.
- Use only the facts given. Do not invent names, prices, discounts, offers, or dates.
- No emojis, no hashtags, no quotation marks, no mention of AI or of being drafted.
- Avoid gendered verb forms where the language allows it.
- Vary the wording and sentence openings each time.
- Tone: ${tone}.
Return only the review text.`;

  const user =
`Shop: ${shop}
Rating: ${stars} out of 5
Bought: ${items.join(", ")}
Visit type: ${visit}
Liked: ${likes.length ? likes.join(", ") : "nothing specific"}
Could be better: ${improve.length ? improve.join(", ") : "nothing"}`;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {"Content-Type": "application/json", "Authorization": "Bearer " + process.env.OPENAI_API_KEY},
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 1,
        max_completion_tokens: 220,
        messages: [{role: "system", content: system}, {role: "user", content: user}]
      })
    });
    if (!r.ok) return json(502, {error: "OpenAI error " + r.status});
    const d = await r.json();
    const review = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content || "").trim();
    if (!review) return json(502, {error: "Empty response"});
    return json(200, {review});
  } catch (e) {
    return json(502, {error: "Request failed"});
  }
};
