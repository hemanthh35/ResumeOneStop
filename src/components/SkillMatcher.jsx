import React, { useState, useMemo } from 'react';
import { Search, Target, TrendingUp, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import jobSkillsData from '../data/jobSkillsDataset.json';

const SkillMatcher = ({ userSkills = "" }) => {
    const [selectedRole, setSelectedRole] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetails, setShowDetails] = useState(false);

    // Normalize skill for matching
    const normalizeSkill = (skill) => {
        if (!skill) return '';
        let normalized = skill.toString().toLowerCase().trim();

        // Check synonyms
        for (const [main, aliases] of Object.entries(jobSkillsData.skill_synonyms || {})) {
            if (aliases.includes(normalized) || normalized === main) {
                return main;
            }
        }
        return normalized;
    };

    // Parse user skills from comma-separated string
    const parseUserSkills = (skillString) => {
        if (!skillString) return [];
        return skillString.split(',')
            .map(s => normalizeSkill(s))
            .filter(s => s.length > 0);
    };

    // Calculate match for a category
    const calculateCategoryMatch = (userSkillSet, roleSkills) => {
        if (!roleSkills || roleSkills.length === 0) return { matched: [], missing: [], score: 0 };

        const normalizedRoleSkills = roleSkills.map(s => normalizeSkill(s));
        const matched = normalizedRoleSkills.filter(s => userSkillSet.has(s));
        const missing = normalizedRoleSkills.filter(s => !userSkillSet.has(s));
        const score = roleSkills.length > 0 ? (matched.length / roleSkills.length) : 0;

        return { matched, missing, score };
    };

    // Main matching logic
    const matchResult = useMemo(() => {
        if (!selectedRole || !userSkills) {
            return null;
        }

        const role = jobSkillsData.jobs.find(j => j.id === selectedRole);
        if (!role) return null;

        const userSkillList = parseUserSkills(userSkills);
        const userSkillSet = new Set(userSkillList);

        const weights = jobSkillsData.skill_weights;

        const categories = {
            core_skills: calculateCategoryMatch(userSkillSet, role.core_skills),
            frameworks: calculateCategoryMatch(userSkillSet, role.frameworks),
            languages: calculateCategoryMatch(userSkillSet, role.languages),
            tools: calculateCategoryMatch(userSkillSet, role.tools),
            cloud: calculateCategoryMatch(userSkillSet, role.cloud),
            bonus: calculateCategoryMatch(userSkillSet, role.bonus)
        };

        // Calculate weighted score
        const totalScore = (
            categories.core_skills.score * weights.core_skills +
            categories.frameworks.score * weights.frameworks +
            categories.languages.score * weights.languages +
            categories.tools.score * weights.tools +
            categories.cloud.score * weights.cloud +
            categories.bonus.score * weights.bonus
        ) * 100;

        // Get all missing skills with priority
        const allMissing = [
            ...categories.core_skills.missing.map(s => ({ skill: s, priority: 'high', category: 'Core Skills' })),
            ...categories.frameworks.missing.map(s => ({ skill: s, priority: 'high', category: 'Frameworks' })),
            ...categories.languages.missing.map(s => ({ skill: s, priority: 'medium', category: 'Languages' })),
            ...categories.tools.missing.map(s => ({ skill: s, priority: 'medium', category: 'Tools' })),
            ...categories.cloud.missing.map(s => ({ skill: s, priority: 'low', category: 'Cloud' })),
            ...categories.bonus.missing.map(s => ({ skill: s, priority: 'low', category: 'Bonus' }))
        ];

        // Get all matched skills
        const allMatched = [
            ...categories.core_skills.matched,
            ...categories.frameworks.matched,
            ...categories.languages.matched,
            ...categories.tools.matched,
            ...categories.cloud.matched,
            ...categories.bonus.matched
        ];

        // Learning path - prioritized missing skills
        const learningPath = allMissing
            .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .slice(0, 10);

        return {
            role: role.job_role,
            score: Math.round(totalScore),
            categories,
            allMatched,
            allMissing,
            learningPath,
            totalRequired: Object.values(categories).reduce((sum, c) => sum + c.matched.length + c.missing.length, 0),
            totalMatched: allMatched.length
        };
    }, [selectedRole, userSkills]);

    // Filter roles based on search
    const filteredRoles = useMemo(() => {
        if (!searchTerm) return jobSkillsData.jobs;
        const term = searchTerm.toLowerCase();
        return jobSkillsData.jobs.filter(j =>
            j.job_role.toLowerCase().includes(term) ||
            j.category.toLowerCase().includes(term)
        );
    }, [searchTerm]);

    // Get score color
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-100';
        if (score >= 60) return 'bg-yellow-100';
        if (score >= 40) return 'bg-orange-100';
        return 'bg-red-100';
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'low': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                    <Target className="text-blue-600" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Job-Skill Matcher</h2>
                    <p className="text-sm text-slate-500">See how your skills match with job roles</p>
                </div>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Target Role</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="mt-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                    {filteredRoles.map(role => (
                        <button
                            key={role.id}
                            onClick={() => { setSelectedRole(role.id); setSearchTerm(''); }}
                            className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex justify-between items-center ${selectedRole === role.id ? 'bg-blue-50 text-blue-700' : ''}`}
                        >
                            <span className="font-medium">{role.job_role}</span>
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded">{role.category}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            {matchResult && (
                <div className="space-y-6">
                    {/* Score Card */}
                    <div className={`${getScoreBg(matchResult.score)} rounded-xl p-6 text-center`}>
                        <div className={`text-5xl font-bold ${getScoreColor(matchResult.score)}`}>
                            {matchResult.score}%
                        </div>
                        <div className="text-sm text-slate-600 mt-2">
                            Match Score for <strong>{matchResult.role}</strong>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            {matchResult.totalMatched} of {matchResult.totalRequired} skills matched
                        </div>
                    </div>

                    {/* Matched Skills */}
                    {matchResult.allMatched.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="text-green-600" size={18} />
                                <h3 className="font-semibold text-slate-900">Matched Skills ({matchResult.allMatched.length})</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {matchResult.allMatched.map((skill, i) => (
                                    <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Learning Path */}
                    {matchResult.learningPath.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="text-blue-600" size={18} />
                                <h3 className="font-semibold text-slate-900">What to Learn Next</h3>
                            </div>
                            <div className="space-y-2">
                                {matchResult.learningPath.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-400 text-sm font-mono">{i + 1}.</span>
                                            <span className="font-medium text-slate-800">{item.skill}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">{item.category}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(item.priority)}`}>
                                                {item.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Detailed Breakdown */}
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {showDetails ? 'Hide' : 'Show'} Detailed Breakdown
                    </button>

                    {showDetails && (
                        <div className="space-y-4 border-t pt-4">
                            {Object.entries(matchResult.categories).map(([key, cat]) => (
                                <div key={key} className="bg-slate-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-slate-800 capitalize">
                                            {key.replace('_', ' ')}
                                        </span>
                                        <span className={`font-bold ${getScoreColor(cat.score * 100)}`}>
                                            {Math.round(cat.score * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${cat.score * 100}%` }}
                                        />
                                    </div>
                                    <div className="mt-2 text-xs text-slate-500">
                                        {cat.matched.length} matched, {cat.missing.length} missing
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!matchResult && selectedRole && (
                <div className="text-center py-8 text-slate-500">
                    <AlertCircle className="mx-auto mb-2" size={32} />
                    <p>Add skills in the editor to see your match score</p>
                </div>
            )}

            {!selectedRole && (
                <div className="text-center py-8 text-slate-500">
                    <Target className="mx-auto mb-2 opacity-50" size={32} />
                    <p>Select a job role to see how your skills match</p>
                </div>
            )}
        </div>
    );
};

export default SkillMatcher;
