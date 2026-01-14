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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-start justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-blue-400 p-3 rounded-lg">
                                    <Target size={28} />
                                </div>
                                <h1 className="text-4xl font-bold">Job Skill Analyzer</h1>
                            </div>
                            <p className="text-blue-100 text-lg max-w-2xl">Get AI-powered insights on how your skills match job requirements. Identify gaps and get personalized learning recommendations.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Input Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Job Description */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Search className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Job Description</h2>
                                <p className="text-sm text-slate-500">Paste the full job posting or description</p>
                            </div>
                        </div>
                        <textarea
                            placeholder="Paste the full job description here... Include responsibilities, requirements, and qualifications."
                            className="w-full h-72 px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-sm resize-none font-medium shadow-sm hover:border-slate-300"
                            value={jd}
                            onChange={(e) => setJd(e.target.value)}
                        />
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                            <AlertCircle size={14} />
                            {jd.length} characters
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <Brain className="text-purple-600" size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Your Technical Skills</h2>
                                <p className="text-sm text-slate-500">List all your relevant skills</p>
                            </div>
                        </div>
                        <textarea
                            placeholder="List your skills separated by commas. E.g: React, Node.js, Python, SQL, Docker, AWS..."
                            className="w-full h-72 px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-sm resize-none font-medium shadow-sm hover:border-slate-300"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                        />
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                            <AlertCircle size={14} />
                            {skills.split(',').filter(s => s.trim()).length} skills detected
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-8 p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-4 animate-in">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                            <h3 className="font-bold text-red-900">Error</h3>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Analyze Button */}
                <div className="mb-12">
                    <button
                        onClick={analyzeJob}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 duration-200"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={22} />
                                <span>Analyzing Your Skills...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={22} />
                                <span>Run Skill Analysis</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
{/* Results Section */}
                {analysis && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                        {/* Score Card */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* GPA Score */}
                            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transition-all">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Skill GPA Score</div>
                                <div className={`text-8xl font-black mb-4 ${parseInt(analysis.gpa) >= 70 ? 'text-emerald-600' : parseInt(analysis.gpa) >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {analysis.gpa}
                                </div>
                                <div className="text-sm font-semibold text-slate-600 mb-4">out of 100</div>
                                <div className={`inline-block px-4 py-2 rounded-full text-xs font-bold ${parseInt(analysis.gpa) >= 70 ? 'bg-emerald-100 text-emerald-700' : parseInt(analysis.gpa) >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                    {parseInt(analysis.gpa) >= 70 ? '✓ Good Match' : parseInt(analysis.gpa) >= 50 ? '⚠ Moderate Match' : '✗ Needs Work'}
                                </div>
                            </div>

                            {/* Matched Skills */}
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 p-8 shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-emerald-600 text-white p-3 rounded-lg">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-emerald-900">Your Matched Skills</h3>
                                </div>
                                <div className="space-y-2">
                                    {analysis.has.length > 0 ? (
                                        analysis.has.map((skill, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-emerald-200">
                                                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                                                <span className="text-sm font-medium text-emerald-900">{skill}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-emerald-600 italic">No matching skills found</p>
                                    )}
                                </div>
                            </div>

                            {/* Missing Skills */}
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border-2 border-red-200 p-8 shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-red-600 text-white p-3 rounded-lg">
                                        <AlertCircle size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-red-900">Missing Skills</h3>
                                </div>
                                <div className="space-y-2">
                                    {analysis.missing.length > 0 ? (
                                        analysis.missing.map((skill, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-red-200">
                                                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                                                <span className="text-sm font-medium text-red-900">{skill}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-red-600 italic">You have all required skills!</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Required Skills Overview */}
                        <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Target className="text-blue-600" size={20} />
                                </div>
                                All Required Skills for This Role
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {analysis.required.map((skill, idx) => (
                                    <div
                                        key={idx}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${
                                            analysis.has.some(s => s.toLowerCase() === skill.toLowerCase())
                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                                : 'bg-slate-100 text-slate-700 border-slate-300'
                                        }`}
                                    >
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Learning Path */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 shadow-xl text-white">
                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <div className="bg-yellow-400 text-slate-900 p-3 rounded-lg">
                                    <Brain size={24} />
                                </div>
                                Your Learning Path
                            </h3>
                            <div className="bg-white/10 rounded-xl p-6 border border-white/20 backdrop-blur-sm">
                                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-100 leading-relaxed">
                                    {analysis.learn}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobAnalyzer;
