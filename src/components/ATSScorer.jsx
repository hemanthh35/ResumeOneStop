import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, Loader2, CheckCircle2, Award, TrendingUp, AlertTriangle, X } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker from local public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const ATSScorer = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [atsScore, setAtsScore] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const selectedModel = 'meta-llama/llama-3.1-8b-instruct'; // Faster model

    const handleFileUpload = async (event) => {
        const uploadedFile = event.target.files[0];
        if (!uploadedFile) return;

        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!validTypes.includes(uploadedFile.type)) {
            setError('Please upload a PDF, DOC, DOCX, or TXT file.');
            return;
        }

        setFile(uploadedFile);
        setError('');
        setAtsScore(null);
        
        // Extract text from file
        try {
            const text = await extractTextFromFile(uploadedFile);
            setExtractedText(text);
        } catch (err) {
            setError('Failed to read file. Please try again.');
            console.error(err);
        }
    };

    const extractTextFromFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    let text = '';
                    
                    if (file.type === 'application/pdf') {
                        // For PDF files, use a different approach
                        // Since we can't easily parse PDF in browser without libraries,
                        // we'll use FormData to send to a conversion endpoint
                        // For now, we'll try to extract what we can
                        const arrayBuffer = await file.arrayBuffer();
                        text = await extractPDFText(arrayBuffer);
                    } else {
                        // For DOC/DOCX/TXT - read as text
                        text = e.target.result;
                    }
                    
                    // Clean and compress the text
                    text = cleanResumeText(text);
                    
                    if (!text || text.length < 50) {
                        reject(new Error('Unable to extract text from file. Please try uploading a TXT or DOCX file instead.'));
                        return;
                    }
                    
                    resolve(text);
                } catch (err) {
                    reject(err);
                }
            };
            
            reader.onerror = reject;
            
            // Read as ArrayBuffer for PDF, as text for others
            if (file.type === 'application/pdf') {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        });
    };

    const extractPDFText = async (arrayBuffer) => {
        try {
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            
            // Extract text from each page
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + ' ';
            }
            
            return fullText.trim();
        } catch (error) {
            console.error('PDF extraction error:', error);
            throw new Error('Failed to extract text from PDF. Please ensure the file is not corrupted.');
        }
    };

    const cleanResumeText = (text) => {
        if (!text) return '';
        
        // Remove excessive whitespace and newlines
        text = text.replace(/\s+/g, ' ');
        
        // Remove special characters that don't add value
        text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        
        // Remove multiple spaces
        text = text.replace(/ {2,}/g, ' ');
        
        // Remove leading/trailing whitespace
        text = text.trim();
        
        // Limit to first 15000 characters (roughly 3000-4000 tokens)
        // A typical resume should be much shorter anyway
        if (text.length > 15000) {
            text = text.substring(0, 15000) + '... [content truncated for analysis]';
        }
        
        return text;
    };

    const analyzeATS = async () => {
        if (!extractedText.trim()) {
            setError('No text extracted from file. Please try another file.');
            return;
        }
        if (!apiKey || !apiKey.trim()) {
            setError('OpenRouter API Key missing. Check your .env file.');
            return;
        }

        setLoading(true);
        setError('');

        const systemPrompt = `You are an ATS analyzer. Analyze the resume and provide ONLY the score, grade, and brief analysis. No markdown, no asterisks, plain text only.

OUTPUT FORMAT (EXACTLY AS SHOWN):

ATS SCORE: [0-100]

GRADE: [A+/A/B+/B/C+/C/D/F]

STRENGTHS:
1. [First strength]
2. [Second strength]
3. [Third strength]

CRITICAL ISSUES:
1. [First issue]
2. [Second issue]
3. [Third issue]

RECOMMENDATIONS:
1. [First recommendation]
2. [Second recommendation]
3. [Third recommendation]
4. [Fourth recommendation]
5. [Fifth recommendation]

KEYWORDS FOUND: [number]

MISSING KEYWORDS: [list 5-7 important keywords]

Be concise. No formatting. Plain text only.`;

        const userPrompt = `Analyze this resume quickly:

${extractedText.substring(0, 12000)}

Provide analysis in the exact format specified. Be concise.`;

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'Resume ATS Scorer'
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
            const analysis = result.choices?.[0]?.message?.content || 'No analysis generated.';
            setAtsScore(parseATSResponse(analysis));
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message || 'Failed to analyze resume. Check your API key and try again.');
        } finally {
            setLoading(false);
        }
    };

    const parseATSResponse = (response) => {
        // Extract score from response
        const scoreMatch = response.match(/ATS SCORE:\s*(\d+)/i);
        const gradeMatch = response.match(/GRADE:\s*([A-F][+]?)/i);
        
        return {
            score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
            grade: gradeMatch ? gradeMatch[1] : 'N/A',
            fullAnalysis: response
        };
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 80) return 'text-blue-600';
        if (score >= 70) return 'text-yellow-600';
        if (score >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score) => {
        if (score >= 90) return 'bg-green-50 border-green-200';
        if (score >= 80) return 'bg-blue-50 border-blue-200';
        if (score >= 70) return 'bg-yellow-50 border-yellow-200';
        if (score >= 60) return 'bg-orange-50 border-orange-200';
        return 'bg-red-50 border-red-200';
    };

    const clearFile = () => {
        setFile(null);
        setExtractedText('');
        setAtsScore(null);
        setError('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg mb-4">
                        <Award className="animate-pulse" size={24} />
                        <h1 className="text-xl md:text-2xl font-bold">ATS Score Checker</h1>
                    </div>
                    <p className="text-slate-600 text-base md:text-lg px-4">
                        Upload your resume and get an instant ATS compatibility score
                    </p>
                </div>

                {/* Upload Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-slate-200 mb-6">
                    {!file ? (
                        <label className="flex flex-col items-center justify-center cursor-pointer">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <div className="w-full border-4 border-dashed border-purple-300 rounded-xl p-8 md:p-12 hover:border-purple-500 transition-all text-center">
                                <Upload className="mx-auto mb-4 text-purple-500" size={48} />
                                <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">
                                    Upload Your Resume
                                </h3>
                                <p className="text-slate-600 mb-4">
                                    Drag and drop or click to browse
                                </p>
                                <p className="text-sm text-slate-500">
                                    Supports PDF, DOCX, TXT (Max 10MB)
                                </p>
                                <p className="text-xs text-green-600 mt-2">
                                    ✅ All formats supported with proper text extraction
                                </p>
                            </div>
                        </label>
                    ) : (
                        <div className="flex items-center justify-between bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <FileText className="text-purple-600" size={32} />
                                <div>
                                    <p className="font-semibold text-slate-800">{file.name}</p>
                                    <p className="text-sm text-slate-600">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={clearFile}
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            >
                                <X className="text-red-500" size={24} />
                            </button>
                        </div>
                    )}

                    {file && !atsScore && (
                        <button
                            onClick={analyzeATS}
                            disabled={loading}
                            className="w-full mt-6 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    Analyzing Resume...
                                </>
                            ) : (
                                <>
                                    <TrendingUp size={24} />
                                    Get ATS Score
                                </>
                            )}
                        </button>
                    )}
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

                {/* ATS Score Results */}
                {atsScore && (
                    <div className="space-y-6">
                        {/* Score Card */}
                        <div className={`rounded-2xl shadow-2xl p-6 md:p-8 border-2 ${getScoreBgColor(atsScore.score)}`}>
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-3 mb-4">
                                    <CheckCircle2 className="text-purple-600" size={32} />
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                                        Your ATS Score
                                    </h2>
                                </div>
                                <div className="flex items-center justify-center gap-6 flex-wrap">
                                    <div>
                                        <div className={`text-6xl md:text-7xl font-bold ${getScoreColor(atsScore.score)}`}>
                                            {atsScore.score}
                                        </div>
                                        <p className="text-slate-600 text-lg">out of 100</p>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-4xl md:text-5xl font-bold ${getScoreColor(atsScore.score)}`}>
                                            {atsScore.grade}
                                        </div>
                                        <p className="text-slate-600">Grade</p>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-slate-200 rounded-full h-4 mb-4">
                                <div
                                    className={`h-4 rounded-full transition-all duration-1000 ${
                                        atsScore.score >= 90 ? 'bg-green-500' :
                                        atsScore.score >= 80 ? 'bg-blue-500' :
                                        atsScore.score >= 70 ? 'bg-yellow-500' :
                                        atsScore.score >= 60 ? 'bg-orange-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${atsScore.score}%` }}
                                />
                            </div>

                            {/* Score Interpretation */}
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                                {atsScore.score >= 90 && (
                                    <p className="text-green-700">
                                        <strong>🎉 Excellent!</strong> Your resume is highly optimized for ATS systems.
                                    </p>
                                )}
                                {atsScore.score >= 80 && atsScore.score < 90 && (
                                    <p className="text-blue-700">
                                        <strong>👍 Very Good!</strong> Your resume should pass most ATS systems with minor improvements.
                                    </p>
                                )}
                                {atsScore.score >= 70 && atsScore.score < 80 && (
                                    <p className="text-yellow-700">
                                        <strong>⚠️ Good!</strong> Your resume needs some optimization for better ATS compatibility.
                                    </p>
                                )}
                                {atsScore.score >= 60 && atsScore.score < 70 && (
                                    <p className="text-orange-700">
                                        <strong>⚡ Fair!</strong> Significant improvements needed for ATS optimization.
                                    </p>
                                )}
                                {atsScore.score < 60 && (
                                    <p className="text-red-700">
                                        <strong>🚨 Needs Work!</strong> Major revisions required for ATS compatibility.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Detailed Analysis */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-slate-200">
                            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText size={24} className="text-purple-600" />
                                Detailed Analysis
                            </h3>
                            <div className="bg-slate-50 rounded-xl p-6 text-slate-700 whitespace-pre-wrap font-mono text-sm leading-relaxed border border-slate-200">
                                {atsScore.fullAnalysis}
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="text-center">
                            <button
                                onClick={clearFile}
                                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                            >
                                <Upload size={20} />
                                Analyze Another Resume
                            </button>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                {!file && !loading && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">How it works:</h3>
                        <ol className="space-y-3 text-slate-600">
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                <span>Upload your resume in PDF, DOC, DOCX, or TXT format</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                <span>Our AI analyzes your resume for ATS compatibility</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                                <span>Get a detailed score (0-100) and grade (A+ to F)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                                <span>Review recommendations to improve your resume</span>
                            </li>
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ATSScorer;
