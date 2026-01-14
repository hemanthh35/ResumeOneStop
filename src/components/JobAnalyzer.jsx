import React, { useState } from 'react';
import { Target, Search, Loader2, CheckCircle2, AlertCircle, Sparkles, Brain, ArrowRight } from 'lucide-react';

const JobAnalyzer = ({ userSkills }) => {
    const [jd, setJd] = useState('');
    const [skills, setSkills] = useState(userSkills || '');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState('');
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const selectedModel = 'meta-llama/llama-3.3-70b-instruct';

    const analyzeJob = async () => {
        if (!jd.trim()) {
            setError('Please paste a job description first.');
            return;
        }
        if (!skills.trim()) {
            setError('Please provide your skills.');
            return;
        }
        if (!apiKey || !apiKey.trim()) {
            setError('OpenRouter API Key missing from environment. Check your .env file.');
            return;
        }

        setLoading(true);
        setError('');
        setAnalysis(null);

        const systemPrompt = `You are a professional Applicant Tracking System (ATS), technical recruiter, and career intelligence engine.

Your task is to compare a Job Description (JD) with a user's skills and return a precise, structured skill match analysis.

Your goals:
- Evaluate job fit accurately
- Identify missing technical skills
- Highlight company expectations
- Generate a numeric match score (Skill GPA)

You must behave like an industry hiring system, not a chatbot.
Be analytical, structured, and concise.`;

        const userPrompt = `I will provide two inputs:

1) JOB DESCRIPTION (JD)
2) USER SKILLS

You must analyze both and return exactly THREE SECTIONS:

----------------------------------------
OUTPUT FORMAT (STRICT – DO NOT CHANGE):

1. SKILL GPA (0–100):
<single numeric value>

2. COMPANY EXPECTATION vs USER SKILLS:
- Required: <comma-separated list of skills the job expects>
- User Has: <skills from the user's list that match the JD>
- Missing: <skills required by the JD but not in the user's skills>

3. WHAT THE USER MUST LEARN:
<prioritized numbered list of missing skills with short explanations>

----------------------------------------
SCORING RULES FOR SKILL GPA:

- Extract only REAL technical skills:
  Languages, Frameworks, Libraries, Tools, Platforms, Databases, Cloud, DevOps, AI/ML tools.
- Ignore generic words such as:
  "experience", "strong", "candidate", "developer", "hands-on", "looking", "proficient", "knowledge".
- Give weight based on importance:
  Core skills = high weight
  Frameworks / tools = medium weight
  Bonus / optional skills = low weight
- Compute Skill GPA using this logic:
  (Matched Required Skills / Total Required Skills) × 100
- Round to the nearest whole number.

----------------------------------------
RULES FOR COMPANY EXPECTATION:

- Extract only explicit or clearly implied skills from the JD.
- Do NOT invent skills that are not mentioned or implied.
- Group only relevant technical competencies.

----------------------------------------
RULES FOR "WHAT THE USER MUST LEARN":

- Include ONLY skills in the "Missing" list.
- Order by importance:
  1) Core job requirements
  2) Frameworks / platforms
  3) Bonus or optional tools
- Each item must contain:
  Skill Name – one-line reason why it matters for this job.
- Do NOT repeat skills already listed under "User Has".

----------------------------------------
STRICT CONSTRAINTS:

- DO NOT use motivational language.
- DO NOT include soft skills.
- DO NOT explain the job description.
- DO NOT output anything outside the three required sections.
- DO NOT include markdown, emojis, or extra text.
- Be ATS-style, objective, and professional.

----------------------------------------
INPUT:

JOB DESCRIPTION:
${jd}

USER SKILLS:
${skills}

----------------------------------------
NOW ANALYZE AND RETURN THE OUTPUT IN THE EXACT FORMAT.`;

        try {
            console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
            console.log('Model:', selectedModel);
            
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.origin || 'http://localhost',
                    'X-Title': 'Professional Resume Builder',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error('OpenRouter Error:', errData);
                
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded (429). You may have run out of credits or are sending requests too fast. Please check your OpenRouter dashboard or try again in a moment.');
                }
                if (response.status === 400) {
                    throw new Error(`Bad Request (400): ${errData.error?.message || JSON.stringify(errData)}`);
                }
                if (response.status === 401) {
                    throw new Error('Invalid API Key (401). Please check your OpenRouter API key.');
                }
                throw new Error(errData.error?.message || `API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const text = data.choices[0].message.content;
            parseAnalysis(text);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const parseAnalysis = (text) => {
        try {
            // Very simple parsing based on the strict format
            const gpaMatch = text.match(/1\. SKILL GPA \(0–100\):\s*(\d+)/i);
            const expectationMatch = text.match(/2\. COMPANY EXPECTATION vs USER SKILLS:\s*(.*?)(?=\n\n3\.|\n3\.|$)/is);
            const learnMatch = text.match(/3\. WHAT THE USER MUST LEARN:\s*(.*)/is);

            if (!gpaMatch) throw new Error('Could not parse GPA. The AI response was not in the expected format.');

            const expectationText = expectationMatch ? expectationMatch[1] : '';
            const requiredMatch = expectationText.match(/- Required:\s*(.*)/i);
            const hasMatch = expectationText.match(/- User Has:\s*(.*)/i);
            const missingMatch = expectationText.match(/- Missing:\s*(.*)/i);

            setAnalysis({
                gpa: gpaMatch[1],
                required: requiredMatch ? requiredMatch[1].split(',').map(s => s.trim()) : [],
                has: hasMatch ? hasMatch[1].split(',').map(s => s.trim()) : [],
                missing: missingMatch ? missingMatch[1].split(',').map(s => s.trim()) : [],
                learn: learnMatch ? learnMatch[1].trim() : ''
            });
        } catch (err) {
            console.error('Parsing error:', err);
            setError('Failed to parse the AI output. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-heading">Job Skill Analyzer</h1>
                    <p className="text-slate-500 mt-1">Check how your skills stack up against any job description.</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl">
                    <Sparkles className="text-blue-600" size={20} />
                    <span className="text-sm font-semibold text-blue-700">AI-Powered Analysis</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Inputs Sidebar */}
                <div className="lg:col-span-12 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                                        <Briefcase size={16} className="text-slate-400" />
                                        Job Description
                                    </label>
                                    <textarea
                                        placeholder="Paste the full job description here..."
                                        className="w-full h-64 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm resize-none"
                                        value={jd}
                                        onChange={(e) => setJd(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                                        <Brain size={16} className="text-slate-400" />
                                        Your Technical Skills
                                    </label>
                                    <textarea
                                        placeholder="List your skills (e.g. React, Node.js, SQL...)"
                                        className="w-full h-64 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm resize-none"
                                        value={skills}
                                        onChange={(e) => setSkills(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={analyzeJob}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Analyzing Job Fit...
                                    </>
                                ) : (
                                    <>
                                        <Target size={20} />
                                        Run Skill Analysis
                                    </>
                                )}
                            </button>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in slide-in-from-top-2">
                                    <AlertCircle className="shrink-0 mt-0.5" size={18} />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Section */}
                    {analysis && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                            {/* Score Card */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Skill GPA</div>
                                    <div className={`text-7xl font-black ${parseInt(analysis.gpa) > 70 ? 'text-green-600' : 'text-orange-500'}`}>
                                        {analysis.gpa}
                                    </div>
                                    <div className="mt-4 text-sm font-medium text-slate-500">Industry Fitness Score</div>
                                </div>

                                <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                                    <Sparkles className="absolute top-[-20px] right-[-20px] text-white/10" size={120} />
                                    <div className="relative z-10">
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <Sparkles className="text-yellow-400" size={20} />
                                            Company Expectation vs User Skills
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Required Technical Skills</span>
                                                <p className="text-sm font-medium leading-relaxed">{analysis.required.join(', ')}</p>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-green-400/70 uppercase tracking-wider">Matching Skills (User Has)</span>
                                                <p className="text-sm font-medium text-green-400">{analysis.has.join(', ') || 'None matched'}</p>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-red-400/70 uppercase tracking-wider">Missing Competencies</span>
                                                <p className="text-sm font-medium text-red-400">{analysis.missing.join(', ') || 'No missing skills!'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Learning Path */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <ArrowRight className="text-blue-600" size={24} />
                                    What You Must Learn
                                </h3>
                                <div className="prose prose-slate max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        {analysis.learn}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Simple icon fallbacks if lucide-react isn't available or specific icons are missing
const Briefcase = ({ size, className }) => <Target size={size} className={className} />;

export default JobAnalyzer;
