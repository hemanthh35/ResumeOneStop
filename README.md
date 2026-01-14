# ResumeCoderr - AI-Powered Resume Builder

A modern, frontend-first web application for building professional ATS-friendly resumes and analyzing job fit using AI.

## 🎯 Features

### 1️⃣ Resume Builder & Editor
- Edit all resume sections (contact, summary, experience, projects, skills, etc.)
- 4 professional resume templates with real-time preview
- Export to PDF with one click
- Mobile-responsive editor interface

### 2️⃣ AI-Powered Job Analyzer
- Paste job descriptions and your skills
- Get Skill GPA score (0-100%) powered by LLM
- See required vs missing skills breakdown
- Get prioritized learning path recommendations

## 🧱 Tech Stack

### Frontend
- **Framework**: React.js 19.2.0 with Hooks
- **Build Tool**: Vite 7.2.4 (ultra-fast bundler)
- **Styling**: Tailwind CSS 4.1.18 with JIT compilation
- **Icons**: Lucide React 0.562.0
- **PDF Export**: html2pdf.js 0.14.0
- **Utilities**: clsx, tailwind-merge

### AI & LLM Integration
- **Provider**: OpenRouter API (openrouter.ai)
- **Model**: Meta Llama 3.3 70B Instruct
- **Purpose**: Job description analysis, skill matching, gap analysis
- **Configuration**: Free tier available, pay-as-you-go after

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- OpenRouter API Key (get free at [openrouter.ai](https://openrouter.ai/keys))

### Setup

```bash
# Install dependencies
npm install

# Create .env file with your API key
echo "VITE_OPENROUTER_API_KEY=your-key-here" > .env

# Run development server
npm run dev
```

Frontend runs on `http://localhost:5173` (Vite default)

### Production Build
```bash
npm run build
npm run preview
```

## 🔌 API Integration

### Job Analyzer
Uses OpenRouter API with Meta Llama 3.3 70B model for:
- Job description parsing
- Skill requirement extraction
- User skill matching
- Gap analysis
- Learning path generation

**Request:**
```
POST https://openrouter.ai/api/v1/chat/completions
Headers: Authorization: Bearer YOUR_KEY
Body: {
  "model": "meta-llama/llama-3.3-70b-instruct",
  "messages": [...],
  "temperature": 0.7
}
```

**Output:**
- Skill GPA (0-100 match score)
- Required skills breakdown
- Missing skills with priorities
- Learning recommendations

## 📁 Project Structure

```
resume_saandeep/
├── src/
│   ├── components/
│   │   ├── ResumeEditor.jsx      # Resume editing interface
│   │   ├── ResumePreview.jsx     # 4 resume templates
│   │   ├── JobAnalyzer.jsx       # AI job analysis (OpenRouter)
│   │   └── Navbar.jsx            # Navigation & controls
│   ├── App.jsx                    # Main app logic
│   ├── main.jsx                   # React entry point
│   ├── App.css                    # Component styles
│   ├── index.css                  # Tailwind directives
│   └── assets/                    # Images & static files
├── public/                         # Static assets
├── index.html                     # HTML template
├── .env                           # API keys (not in git)
├── package.json                   # Dependencies
├── vite.config.js                 # Vite build config
├── eslint.config.js               # Linting rules
└── README.md
```

## 🚀 Usage

### Building a Resume (3 Steps)
1. **Editor Tab** - Fill in your information:
   - Contact details (name, email, phone, location, LinkedIn, GitHub, portfolio)
   - Summary, experience, projects, skills, certifications
   - Education, awards, hackathons, publications, teaching, languages

2. **Preview Tab** - Choose template style:
   - ATS Classic (simple B&W, best for parsing)
   - SimpleCV LaTeX (academic serif style)
   - SimpleCV Academic (indigo-themed indented)
   - Creative Compact (modern header design)

3. **Download** - Click "Download as PDF"

### Analyzing Job Fit (4 Steps)
1. **Analyzer Tab** - Paste job description
2. Enter or update your skills
3. Click "Analyze" button
4. View results:
   - **Skill GPA**: Your match percentage (0-100%)
   - **Matched Skills**: What you already have
   - **Missing Skills**: What you need to learn (prioritized)
   - **Learning Path**: Top 10 recommendations

## ✨ Key Features

### Resume Templates
1. **ATS Classic** - Single column, no colors (passes ATS scanners)
2. **SimpleCV LaTeX** - Serif fonts, academic layout
3. **SimpleCV Academic** - Indigo accents, indented structure
4. **Creative Compact** - Modern header, condensed sections

All templates:
- ✅ ATS-friendly formatting
- ✅ Print & PDF optimized
- ✅ Mobile-responsive editor
- ✅ Real-time preview

### Job Analysis (AI-Powered)
- ✅ LLM extracts required skills from JD
- ✅ Matches against your skills
- ✅ Scores each category by importance
- ✅ Provides learning recommendations
- ✅ No data stored (all local/API)

## 🧪 Data & Validation

### Resume Editor
- ✅ All data stored in browser state
- ✅ Real-time validation
- ✅ Empty sections auto-hide
- ✅ Supports 8+ resume sections
- ✅ PDF exports from preview

### Job Analyzer
- ✅ Validates job description input
- ✅ Validates skills list
- ✅ Checks API key availability
- ✅ Handles API errors gracefully
- ✅ Shows loading states

## 🔒 Privacy & Security

- 🌐 **Frontend-Only**: No backend server needed
- 📄 **Data Privacy**: Resume data stays in your browser (never saved)
- 🚫 **No Database**: No user accounts, no data storage
- 🔐 **API Only**: OpenRouter API calls for job analysis only
- 📖 **Open Source**: Full code transparency
- ✅ **No Tracking**: No analytics or cookies

**Note:** Your resume data exists only in browser memory. Close the tab and it's gone. For persistence, use localStorage or export PDF.

## 📝 Resume Templates

### 1. ATS Classic
- Single column layout
- Black & white only
- Optimized for ATS systems
- Best for automated scanning

### 2. SimpleCV LaTeX
- Serif typography (Georgia, Times New Roman)
- Academic indentation style
- Professional appearance
- Good for technical roles

### 3. SimpleCV Academic
- Indigo accent colors
- Structured sections with indents
- Clean typography
- Modern yet formal

### 4. Creative Compact
- Modern header design
- Compact spacing
- Professional yet creative
- Multi-section layout

All are print-friendly and PDF-optimized.

## 🛠 Development

```bash
# Install dependencies
npm install

# Development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Variables
Create `.env` file:
```
VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
```

Get free key: https://openrouter.ai/keys

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

This is an academic project. Feel free to fork and enhance!

## ⚠️ Important Notes

1. **API Key Required**: Get free OpenRouter key at https://openrouter.ai/keys
2. **Environment File**: Never commit `.env` to git
3. **API Costs**: Free tier available, then $5-20/month for regular use
4. **Resume Data**: Only persists in current browser session
5. **PDF Export**: Uses html2canvas + jsPDF (works offline)
6. **Dependencies**: Run `npm install` before first use

## 🎓 Technologies Demonstrated

- ✅ Modern React patterns (Hooks, functional components)
- ✅ Vite bundler for ultra-fast dev/build
- ✅ Tailwind CSS utility-first styling
- ✅ LLM API integration (OpenRouter)
- ✅ Client-side file generation (PDF export)
- ✅ Responsive UI design
- ✅ Component composition patterns
- ✅ State management with React hooks
- ✅ Form handling & validation
- ✅ Real-time preview rendering

---

**Built with React + Vite + Tailwind + AI** | Frontend-First Architecture | No Backend Required
