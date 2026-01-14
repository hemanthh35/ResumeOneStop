# Resume Intelligence Platform

A full-stack web application that ranks skills using ML and generates ATS-friendly resumes.

## 🎯 Features

### 1️⃣ Resume Skill Ranking (ML Integration)
- Analyze how your skills match with job descriptions
- Get skill relevance scores (0-100%)
- Overall profile match percentage
- Discover what skills you need to learn
- Project relevance analysis

### 2️⃣ Auto Resume Builder (Rule-Based Engine)
- Generate professional ATS-friendly resumes
- 4 different template styles
- Export as PDF or DOCX
- Skill-based optimization
- Deterministic output (same input = same resume)

## 🧱 Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS
- Axios for API calls
- React Router for navigation

### Backend
- Python Flask
- scikit-learn (TF-IDF + Cosine Similarity)
- joblib (model loading)
- ReportLab (PDF generation)
- python-docx (DOCX generation)

### ML
- Pretrained TF-IDF model
- Cosine similarity for scoring
- No text generation or LLMs

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- pip

### Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Place your trained model
# Ensure tfidf_resume_model.pkl is in backend/ml/ folder

# Run the Flask server
python app.py
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔌 API Endpoints

### 1. Health Check
```
GET /api/health
```

### 2. Skill Ranking
```
POST /api/skill-rank

Request:
{
  "job_description": "Looking for Python developer...",
  "skills": ["Python", "SQL", "Machine Learning"],
  "projects": ["ML project description..."],
  "internships": ["Internship at XYZ..."]
}

Response:
{
  "skill_scores": {"Python": 0.82, "SQL": 0.76, ...},
  "project_scores": {...},
  "overall_match_score": 0.71,
  "missing_skills": ["Docker", "Kubernetes", "AWS"]
}
```

### 3. Build Resume
```
POST /api/build-resume

Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "branch": "Computer Science",
  "cgpa": 8.5,
  "skills": ["Python", "SQL"],
  "projects": ["Project 1..."],
  "internships": [],
  "certifications": [],
  "achievements": [],
  "skill_scores": {"Python": 0.82},
  "template": 1,
  "format": "pdf"
}

Response: PDF or DOCX file download
```

## 📁 Project Structure

```
resume_saandeep/
├── backend/
│   ├── app.py                 # Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── ml/
│   │   ├── scorer.py         # ML scoring logic
│   │   └── tfidf_resume_model.pkl  # Trained model
│   ├── resume/
│   │   └── builder.py        # Resume generation
│   └── utils/
│       └── preprocessing.py  # Text processing
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── SkillRanking.jsx
│   │   │   ├── ResumeBuilder.jsx
│   │   │   └── Result.jsx
│   │   ├── components/
│   │   │   ├── JDInput.jsx
│   │   │   ├── SkillGapPanel.jsx
│   │   │   ├── ResumeForm.jsx
│   │   │   └── ResumePreview.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🚀 Usage

### Skill Ranking Flow
1. Navigate to "Skill Ranking" from home page
2. Paste job description
3. Enter your skills (comma-separated)
4. Optionally add projects and internships
5. Click "Analyze Skills"
6. View skill scores, match percentage, and missing skills

### Resume Building Flow
1. Navigate to "Resume Builder" from home page
2. Fill in personal information
3. Add skills, projects, internships, certifications, achievements
4. Select template style (1-4)
5. Choose export format (PDF or DOCX)
6. Click "Generate Resume"
7. Resume downloads automatically

## ✨ Key Features

### ML-Powered Skill Ranking
- Uses TF-IDF vectorization
- Cosine similarity for matching
- Trained on 10,000 resume samples
- Deterministic and reproducible

### Resume Builder Rules
✅ Uses only user-provided data
✅ No text rewriting or generation
✅ Fixed template structure
✅ Top 3 skills highlighted
✅ Projects ordered by relevance
✅ CGPA only shown if ≥ 6.5
✅ Empty sections hidden

### ATS-Friendly Output
- Clean formatting
- Proper section hierarchy
- Keyword optimization
- Standard fonts and spacing
- Professional templates

## 🧪 Validation

The system handles:
- Empty job description → returns zero scores
- No skills → blocks analysis with error
- Invalid input → shows error message
- Missing data → hides sections in resume

## 🔒 Privacy & Security

- Works completely offline
- No external API calls
- No data stored or transmitted
- No LLMs or cloud services
- All processing happens locally

## 📝 Resume Templates

1. **Template 1**: Classic Professional
2. **Template 2**: Modern Minimalist
3. **Template 3**: Two-Column Style
4. **Template 4**: Executive Style

All templates are ATS-friendly and follow industry standards.

## 🛠 Development

### Backend Development
```bash
cd backend
python app.py
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production
```bash
cd frontend
npm run build
```

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

This is an academic project. Feel free to fork and enhance!

## ⚠️ Important Notes

1. **ML Model**: Ensure `tfidf_resume_model.pkl` is in `backend/ml/` folder
2. **CORS**: Backend has CORS enabled for frontend communication
3. **Port Configuration**: Backend runs on 5000, Frontend on 3000
4. **Dependencies**: Install all requirements before running

## 🎓 Academic Context

This project demonstrates:
- ML integration in web applications
- TF-IDF and cosine similarity for text matching
- Rule-based document generation
- Full-stack development with React and Flask
- RESTful API design
- Client-server architecture

---

**Built with ❤️ for Resume Intelligence**
