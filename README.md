# Radhika Jewellers - Smart Customer Review Assistant

An elegant, mobile-friendly customer review assistant tailored for **Radhika Jewellers, Murtizapur**. Designed for customers to quickly draft authentic reviews at the billing counter in Hinglish, Marathi, or English, and post directly to Google Reviews in 30 seconds.

## ✨ Features
- **Trilingual Support**: Defaults to Hinglish, with Marathi and natural English options.
- **Serial-wise Jewellery Categories**: Covers gold, silver, daily wear, wedding sets, and custom orders.
- **Human-to-Human Connection**: Highlights warmth, honest guidance, BIS Hallmarked purity, and generational trust.
- **Instant Google Review Posting**: Automatically copies the draft and opens the direct Google review box for Radhika Jewellers (`Place ID: ChIJj4wJOpPR1jsRXSsVJbX8bUc`).
- **Pre-warmed Serverless Backend**: Netlify Function with OpenAI support and zero-latency offline fallback.
- **Royal Luxury Aesthetic**: Responsive gold and ivory interface with automatic dark mode support.

## 🚀 Deployment on Netlify
1. Connect this GitHub repository to Netlify.
2. Build Settings:
   - **Build Command**: *(leave empty)*
   - **Publish Directory**: `.`
3. *(Optional)* To enable OpenAI custom generation, add your API key in Netlify:
   - Go to **Site Configuration** > **Environment variables** > add `OPENAI_API_KEY`.
   - Without an API key, the built-in intelligent template generator functions 100% offline at zero cost.
