# Campus OS

Campus OS is a production-grade Operating System for Universities, Colleges, and Schools featuring a Student Dashboard, Faculty Dashboard, full Online Code Lab (Compiler & Runner), and AI Tutoring & Academic Assistant.

---

## 🚀 Quick Start & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd CampusOS
npm install
```

### 2. Configure AI Environment (.env.local)
Copy the template configuration file:
```bash
# On Mac/Linux:
cp .env.example .env.local

# On Windows (PowerShell / Command Prompt):
copy .env.example .env.local
```

Open `.env.local` and add your free AI API key:
```bash
# Recommended: Groq Cloud (Free high-speed inference)
# Get a free key in 30 seconds at: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

*(Optional alternatives: `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, or local Ollama)*.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:4028](http://localhost:4028) in your browser.

---

## ☁️ Deploying to Vercel (Production)

Campus OS is built with Next.js App Router and runs out of the box on Vercel Serverless.

### Step-by-Step Vercel Configuration:
1. **Push your repository** to GitHub / GitLab.
2. **Import Project** into [Vercel](https://vercel.com).
3. **Set Environment Variables**:
   In Vercel **Project Settings $\to$ Environment Variables**, add:
   - `GROQ_API_KEY`: `your_groq_api_key` (Applied to: **Production**, **Preview**, **Development**)
   - *(Optional)* `OPENROUTER_API_KEY`: `your_openrouter_api_key`
   - *(Optional)* `GEMINI_API_KEY`: `your_gemini_api_key`
   - `AI_PROVIDER`: `auto`
4. **Deploy / Redeploy**:
   Trigger a deployment. All AI routes (`/api/ai/chat`, `/api/code/ai`, `/api/code/faculty-ai`) will immediately connect to your cloud AI provider.

> [!NOTE]
> **Security Guarantee**: All AI keys are strictly server-side and are NEVER exposed to the browser, client bundle, or logs.

---

## 🧠 Supported AI Providers

Campus OS uses a centralized `AIProviderService` that automatically routes and falls back between providers:

| Provider | Type | Speed | Default Model | Setup Link |
| :--- | :--- | :--- | :--- | :--- |
| **Groq Cloud** *(Primary)* | Free Cloud | Ultra-Fast (~1s) | `llama-3.3-70b-versatile` | [console.groq.com](https://console.groq.com/keys) |
| **OpenRouter** *(Fallback)* | Free Cloud | High | `meta-llama/llama-3.3-70b-instruct:free` | [openrouter.ai](https://openrouter.ai/keys) |
| **Google Gemini** *(Fallback)* | Free Cloud | High | `gemini-1.5-flash` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| **Local Ollama** *(Optional)* | Localhost | Hardware Dependent | `qwen2.5:7b` | [ollama.com](https://ollama.com) |

---

## 💻 Code Lab IDE & Online Compiler

Campus OS includes a full-featured Monaco IDE and isolated sandboxed execution runner:
- **14 Languages Supported**: Python 3, C++ (GCC 14), Java (JDK 17), C, JavaScript, TypeScript, Go, Rust, Kotlin, C#, PHP, Ruby, Swift, Bash.
- **Student Code Lab**: [http://localhost:4028/code-lab](http://localhost:4028/code-lab) (Interactive IDE, Socratic AI Tutor, One-Click Diff Fix, Practice Problem Arena).
- **Faculty Code Lab**: [http://localhost:4028/faculty-code-lab](http://localhost:4028/faculty-code-lab) (Assignment Builder, Question Authoring, Student Submission Evaluator, Rubrics, Viva Questions).

---

## 📦 Available Scripts

- `npm run dev` - Start development server on port 4028
- `npm run type-check` - Run TypeScript compiler check
- `npm run build` - Create production Next.js build
- `npm run lint` - Run ESLint checks