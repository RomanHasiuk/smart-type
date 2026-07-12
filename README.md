# Smart Type 🎙️✨

A modern web application for voice recognition, smart formatting, and automatic translation powered by AI (Google Gemini).

## 🚀 Features
- **Voice Input:** Dictate text directly using your microphone.
- **Smart Editing:** The AI automatically corrects mistakes, removes filler words (like "um" and "uh"), and fixes punctuation.
- **Translation & Tone Adjustment:** Translates the text into your chosen language and adapts the style (Official, Friendly, Poetic, etc.).
- **Text-to-Speech (TTS):** Reads the translated text out loud with an intelligent voice selection based on the language.
- **Customization:** 4 stylish themes, frosted glassmorphism UI, and modern Lucide icons.

## 🛠 Tech Stack
- React (Vite)
- TypeScript
- CSS Variables + CSS Modules
- Google Gemini 3.1 Flash Lite (for fast generation)
- Web Speech API
- Lucide React (Icons)

## 📦 Local Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-type.git
   cd smart-type
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   - Rename `.env.example` to `.env`.
   - Insert your Google Gemini API key:
     ```env
     VITE_GEMINI_API_KEY=your_api_key_here
     ```

4. Run the project:
   ```bash
   npm run dev
   ```

## 🚀 Deploying to Vercel

This project is 100% ready to be deployed on Vercel without any extra configuration.
1. Push your code to your GitHub repository.
2. Go to [Vercel](https://vercel.com/) and import your repository.
3. In the **Environment Variables** section of Vercel settings, you MUST add:
   - Key: `VITE_GEMINI_API_KEY`
   - Value: `your_actual_api_key_here`
4. Click **Deploy**.

Done! Your app will be live and accessible via the Vercel link.
