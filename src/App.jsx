import { useState } from 'react'
import ResumeEditor from './components/ResumeEditor'
import ResumePreview from './components/ResumePreview'
import JobAnalyzer from './components/JobAnalyzer'
import { FileText, Edit3, Layout, Target } from 'lucide-react'
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
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-3 flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-white p-2 rounded-lg">
            <FileText size={20} />
          </div>
          <span className="font-bold text-xl text-slate-900 font-heading">Saandeep<span className="text-primary text-blue-600">Resume</span></span>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setView('editor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'editor' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Edit3 size={16} />
            Editor
          </button>
          <button
            onClick={() => setView('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'preview' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Layout size={16} />
            Preview
          </button>
          <button
            onClick={() => setView('analyzer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'analyzer' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Target size={16} />
            Analyzer
          </button>
        </div>

        <div className="w-[140px] flex justify-end">
          {view === 'preview' && (
            <button
              onClick={handleDownload}
              className="bg-primary text-white bg-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              Download PDF
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {view === 'editor' ? (
          <ResumeEditor data={data} setData={setData} />
        ) : view === 'preview' ? (
          <ResumePreview
            data={data}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
          />
        ) : (
          <JobAnalyzer userSkills={data.skills} />
        )}
      </main>
    </div>
  )
}

export default App
