import React, { useState } from 'react';
import { Sparkles, Copy, CheckCircle2, Loader2, AlertCircle, User, Briefcase } from 'lucide-react';

const SummaryGenerator = ({ userSkills }) => {
    const [skills, setSkills] = useState(userSkills || '');
    const [jd, setJd] = useState('');
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const selectedModel = 'meta-llama/llama-3.3-70b-instruct';

    const generateSummary = async () => {
        if (!skills.trim()) {
            setError('Please provide your skills.');
            return;
        }
        if (!jd.trim()) {
            setError('Please paste a job description.');
            return;
        }
        if (!apiKey || !apiKey.trim()) {
            setError('OpenRouter API Key missing from environment. Check your .env file.');
            return;
        }

        setLoading(true);
        setError('');
        setSummary('');

        const systemPrompt = `You are an elite professional resume writer who crafts CLIENT-LEVEL professional summaries for top-tier positions.

MANDATORY FORMAT - FOLLOW THIS EXACT STYLE:

[Role Title] with hands-on experience in [specific domain/technology area]. Skilled in [5-7 key technologies from user's skills matching JD], with a focus on [what they build/deliver]. Experienced in [action verbs] applications/systems that [impact 1], [impact 2], and [impact 3].

EXAMPLE (USE THIS EXACT STRUCTURE):
"Software Engineer with hands-on experience in cloud-based application development using Google Cloud Platform. Skilled in HTML, CSS, JavaScript, and Git, with a focus on building scalable and reliable web solutions. Experienced in designing and deploying applications that enhance system performance, improve user experience, and support business growth."

CRITICAL RULES:

1️⃣ WRITE IN THIRD PERSON (NOT first person - NO "I")
- ✅ "Software Engineer with hands-on experience..."
- ❌ "I am a Software Engineer..."

2️⃣ SENTENCE STRUCTURE (EXACTLY 3 SENTENCES):
Sentence 1: [Role] with hands-on experience in [specific domain/tech area matching JD]
Sentence 2: Skilled in [5-7 technologies], with a focus on [what they build/solution type]
Sentence 3: Experienced in [designing/building/deploying/developing] [solutions] that [3 business impacts]

3️⃣ PROFESSIONAL VERBS TO USE:
✅ designing, deploying, developing, building, implementing, architecting, engineering, optimizing
✅ enhance, improve, support, enable, streamline, accelerate, scale

4️⃣ NEVER USE:
❌ passionate, eager, learner, interested, aspiring, hope, opportunity, looking for

5️⃣ ROLE POSITIONING:
- Extract the job role from JD (Software Engineer, Data Scientist, ML Engineer, etc.)
- Be specific, not generic
- Match the JD's language

6️⃣ TECHNOLOGY SELECTION:
- Pick 5-7 most relevant technologies from user's skills that appear in JD
- List them naturally: "Python, TensorFlow, AWS, Docker, and Kubernetes"

7️⃣ BUSINESS IMPACT (End with 3 impacts):
- Use format: "that [impact 1], [impact 2], and [impact 3]"
- Examples: "enhance system performance", "improve user experience", "support business growth"
- Focus on business value, not technical details

8️⃣ LENGTH: 60-80 words total, exactly 3 sentences

OUTPUT: Professional summary ONLY. No explanations, no meta-text, no intro.`;

        const userPrompt = `Generate a professional summary using this EXACT format:

"[Role] with hands-on experience in [domain/tech area]. Skilled in [5-7 technologies], with a focus on [solution type]. Experienced in [action verb] [solutions] that [impact 1], [impact 2], and [impact 3]."

MY SKILLS:
${skills}

JOB DESCRIPTION:
${jd}

INSTRUCTIONS:
1. Extract the role title from the JD (e.g., Software Engineer, Data Scientist, ML Engineer)
2. Identify the specific domain/technology area from JD (e.g., "cloud-based application development using AWS")
3. Select 5-7 most relevant technologies from my skills that match the JD
4. State what I build/deliver (e.g., "scalable web solutions", "ML pipelines", "data analytics platforms")
5. List 3 business impacts (e.g., "enhance performance", "improve user experience", "support growth")
6. Use third person, NOT first person (NO "I")
7. Exactly 3 sentences, 60-80 words
8. Professional verbs only: designing, deploying, developing, building, implementing

Generate the summary now.`;

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'Resume Builder'
                },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API Error: ${response.status}`);
            }

            const result = await response.json();
            const generatedSummary = result.choices?.[0]?.message?.content || 'No summary generated.';
            setSummary(generatedSummary.trim());
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message || 'Failed to generate summary. Check your API key and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (summary) {
            navigator.clipboard.writeText(summary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg mb-4">
                        <Sparkles className="animate-pulse" size={24} />
                        <h1 className="text-2xl font-bold">Professional Summary Generator</h1>
                    </div>
                    <p className="text-slate-600 text-lg">
                        Create a tailored professional summary that highlights your best skills
                    </p>
                </div>

                {/* Input Section */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Skills Input */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <User className="text-blue-600" size={20} />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-800">Your Skills</h2>
                        </div>
                        <textarea
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="Enter your skills (e.g., Python, React, Machine Learning, AWS, Docker...)"
                            className="w-full h-48 p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none text-slate-700 placeholder-slate-400"
                        />
                        <p className="text-sm text-slate-500 mt-2">
                            List all your relevant technical skills, separated by commas
                        </p>
                    </div>

                    {/* Job Description Input */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <Briefcase className="text-indigo-600" size={20} />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-800">Job Description</h2>
                        </div>
                        <textarea
                            value={jd}
                            onChange={(e) => setJd(e.target.value)}
                            placeholder="Paste the job description here..."
                            className="w-full h-48 p-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none text-slate-700 placeholder-slate-400"
                        />
                        <p className="text-sm text-slate-500 mt-2">
                            Paste the complete job posting or requirements
                        </p>
                    </div>
                </div>

                {/* Generate Button */}
                <div className="text-center mb-8">
                    <button
                        onClick={generateSummary}
                        disabled={loading}
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={24} />
                                Generate Professional Summary
                            </>
                        )}
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3 text-red-700">
                            <AlertCircle size={24} />
                            <p className="font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {/* Generated Summary */}
                {summary && (
                    <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <CheckCircle2 className="text-green-600" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Your Professional Summary</h2>
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                                    copied
                                        ? 'bg-green-500 text-white'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 size={20} />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy size={20} />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <p className="text-lg leading-relaxed text-slate-800 whitespace-pre-wrap">
                                {summary}
                            </p>
                        </div>
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-800">
                                <strong>💡 Pro Tip:</strong> Use this summary at the top of your resume to make a strong first impression!
                            </p>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                {!summary && !loading && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">How it works:</h3>
                        <ol className="space-y-3 text-slate-600">
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                <span>Enter your technical skills in the left box</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                <span>Paste the job description in the right box</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                                <span>Click "Generate Professional Summary" and let AI create a tailored summary</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                                <span>Copy the generated summary and add it to your resume</span>
                            </li>
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SummaryGenerator;
