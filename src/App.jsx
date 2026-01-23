import { useState, useEffect } from 'react'
import ResumeEditor from './components/ResumeEditor'
import ResumePreview from './components/ResumePreview'
import JobAnalyzer from './components/JobAnalyzer'
import SummaryGenerator from './components/SummaryGenerator'
import ATSScorer from './components/ATSScorer'
import Navbar from './components/Navbar'
import './App.css'
import html2pdf from 'html2pdf.js'

function App() {
  const [data, setData] = useState({
    contact: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: ''
    },
    summary: '',
    experience: [],
    projects: [],
    skills: 'Python, Machine Learning, SQL, Pandas, Scikit-learn, Git',
    certifications: [],
    education: [],
    awards: [],
    hackathons: [],
    publications: [],
    teaching: [],
    extracurricular: [],
    languages: []
  });

  const [view, setView] = useState('editor'); // 'editor' or 'preview'
  const [selectedTemplate, setSelectedTemplate] = useState('template-1');

  // Handle URL query parameter for direct view access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam && ['editor', 'preview', 'analyzer', 'summary', 'ats'].includes(viewParam)) {
      setView(viewParam);
    }
  }, []);

  const handleDownload = () => {
    const element = document.getElementById('resume-to-print');
    if (!element) {
      console.error('Resume element not found!');
      return;
    }

    const opt = {
      margin: 0,
      filename: `${data.contact.fullName || 'Resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        onclone: (doc) => {
          const el = doc.getElementById('resume-to-print');
          if (el) {
            // Force hex/safe colors on the cloned element to avoid oklch parsing errors
            el.style.backgroundColor = '#ffffff';
            el.style.color = '#000000';

            // Ensure proper line-height rendering in PDF
            el.style.WebkitPrintColorAdjust = 'exact';
            el.style.printColorAdjust = 'exact';

            // CRITICAL FIX: oklch colors in CSS variables cause html2canvas to crash.
            // We need to strip or replace oklch references in the cloned document's styles.
            const styleTags = doc.querySelectorAll('style');
            styleTags.forEach(style => {
              if (style.innerHTML.includes('oklch')) {
                // More aggressive replacement including variables and functions
                style.innerHTML = style.innerHTML.replace(/oklch\([^)]+\)/g, '#000000');
                style.innerHTML = style.innerHTML.replace(/--[\w-]+:\s*oklch\([^)]+\);/g, '');
              }
            });

            // Optional: recursively remove oklch from computed styles if needed
            // but usually overriding at the root of the capture is enough.
          }
        }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar view={view} setView={setView} onDownload={handleDownload} />

      <main className="flex-1 overflow-auto">
        {view === 'editor' ? (
          <ResumeEditor data={data} setData={setData} />
        ) : view === 'preview' ? (
          <ResumePreview
            data={data}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
          />
        ) : view === 'analyzer' ? (
          <JobAnalyzer userSkills={data.skills} />
        ) : view === 'summary' ? (
          <SummaryGenerator userSkills={data.skills} />
        ) : view === 'ats' ? (
          <ATSScorer />
        ) : null}
      </main>
    </div>
  )
}

export default App
