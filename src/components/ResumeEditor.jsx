import React, { useState } from 'react';
import {
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    User,
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Github,
    Globe,
    Briefcase,
    Code,
    Award,
    GraduationCap,
    FileText,
    Languages,
    Trophy,
    CheckCircle,
    ExternalLink
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import SkillMatcher from './SkillMatcher';

// Helper for tailwind class merging
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function ResumeEditor({ data, setData }) {

    const [expandedItems, setExpandedItems] = useState({});

    const toggleExpand = (section, id) => {
        setExpandedItems(prev => ({
            ...prev,
            [`${section}-${id}`]: !prev[`${section}-${id}`]
        }));
    };

    const updateContact = (field, value) => {
        setData(prev => ({
            ...prev,
            contact: { ...prev.contact, [field]: value }
        }));
    };

    const addItem = (section, defaultData) => {
        const id = Date.now();
        setData(prev => ({
            ...prev,
            [section]: [...prev[section], { id, ...defaultData }]
        }));
        setExpandedItems(prev => ({
            ...prev,
            [`${section}-${id}`]: true
        }));
    };

    const removeItem = (section, id) => {
        setData(prev => ({
            ...prev,
            [section]: prev[section].filter(item => item.id !== id)
        }));
    };

    const updateItem = (section, id, field, value) => {
        setData(prev => ({
            ...prev,
            [section]: prev[section].map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    const addNestedItem = (section, id, nestedField, defaultValue = '') => {
        setData(prev => ({
            ...prev,
            [section]: prev[section].map(item =>
                item.id === id ? { ...item, [nestedField]: [...(item[nestedField] || []), defaultValue] } : item
            )
        }));
    };

    const updateNestedItem = (section, id, nestedField, index, value) => {
        setData(prev => ({
            ...prev,
            [section]: prev[section].map(item =>
                item.id === id ? {
                    ...item,
                    [nestedField]: item[nestedField].map((ni, i) => i === index ? value : ni)
                } : item
            )
        }));
    };

    const removeNestedItem = (section, id, nestedField, index) => {
        setData(prev => ({
            ...prev,
            [section]: prev[section].map(item =>
                item.id === id ? {
                    ...item,
                    [nestedField]: item[nestedField].filter((_, i) => i !== index)
                } : item
            )
        }));
    };

    const loadSampleData = () => {
        const sampleData = {
            contact: {
                fullName: 'Saandeep Nadukuda',
                email: 'saandeep@example.com',
                phone: '+91 98765 43210',
                location: 'Hyderabad, India',
                linkedin: 'linkedin.com/in/saandeep',
                github: 'github.com/saandeep',
                portfolio: 'saandeep.dev'
            },
            summary: 'Experienced Senior Software Engineer with a passion for building scalable web applications and AI-driven solutions. Proven track record of leading cross-functional teams and delivering high-quality products on time. Expert in React, Node.js, and modern cloud architectures.',
            experience: [
                {
                    id: 1,
                    position: 'Senior Software Engineer',
                    company: 'Tech Solutions Inc.',
                    location: 'Bangalore, India',
                    startDate: '01/2021',
                    endDate: '',
                    current: true,
                    description: 'Lead developer for the flagship SaaS product, serving over 1M monthly active users.',
                    achievements: [
                        'Reduced backend latency by 45% through database optimization and caching strategies.',
                        'Mentored 5 junior developers and improved team velocity by 20%.',
                        'Implemented end-to-end testing, reducing production bugs by 30%.'
                    ]
                },
                {
                    id: 2,
                    position: 'Full Stack Developer',
                    company: 'InnoWealth',
                    location: 'Mumbai, India',
                    startDate: '06/2018',
                    endDate: '12/2020',
                    current: false,
                    description: 'Developed and maintained financial dashboard for high-net-worth individuals.',
                    achievements: [
                        'Built real-time portfolio tracking system using WebSockets.',
                        'Integrated 3rd party financial APIs for automated data synchronization.'
                    ]
                }
            ],
            projects: [
                {
                    id: 3,
                    name: 'AI Resume Analyzer',
                    description: 'An AI-powered tool that analyzes resumes against job descriptions to provide optimization scores.',
                    technologies: 'React, OpenAI API, Python, Flask',
                    link: 'github.com/saandeep/resume-analyzer',
                    highlights: [
                        'Implemented OCR for document parsing with 98% accuracy.',
                        'Used GPT-4 for semantic analysis and feedback generation.'
                    ]
                }
            ],
            skills: 'JavaScript (ES6+), React, Node.js, TypeScript, Next.js, GraphQL, PostgreSQL, MongoDB, AWS, Docker, Kubernetes, Git, Scrum',
            certifications: [
                {
                    id: 4,
                    name: 'AWS Certified Solutions Architect',
                    organization: 'Amazon Web Services',
                    date: '03/2023',
                    id: 'AWS-SA-12345',
                    url: 'https://aws.amazon.com/verification'
                }
            ],
            education: [
                {
                    id: 5,
                    degree: 'B.Tech in Computer Science',
                    institution: 'IIT Hyderabad',
                    location: 'Hyderabad, India',
                    startYear: '2014',
                    endYear: '2018',
                    description: 'Majored in Systems Programming. GPA: 9.2/10'
                }
            ],
            awards: [
                {
                    id: 6,
                    title: 'Innovator of the Year',
                    description: 'Recognized for developing an automated internal tool that saved 200 engineer hours per month.',
                    date: '2022'
                }
            ],
            publications: [
                {
                    id: 11,
                    title: 'Scalable Microservices in Cloud Environments',
                    authors: 'S. Nadukuda, J. Doe',
                    journal: 'Journal of Software Engineering',
                    date: '2023',
                    link: 'https://doi.org/10.1111/jse.2023.001'
                }
            ],
            teaching: [
                {
                    id: 12,
                    role: 'Graduate Teaching Assistant',
                    course: 'Advanced Data Structures',
                    institution: 'IIT Hyderabad',
                    date: '2017 - 2018'
                }
            ],
            extracurricular: [
                {
                    id: 13,
                    activity: 'Open Source Contributor',
                    role: 'Core Contributor',
                    date: '2020 - Present',
                    description: 'Maintained several high-traffic React component libraries.'
                }
            ],
            hackathons: [
                {
                    id: 7,
                    name: 'Global Fintech Hackathon',
                    result: '2nd Place',
                    date: '2019',
                    description: 'Built a peer-to-peer lending platform using decentralized ledger technology.'
                }
            ],
            languages: [
                {
                    id: 8,
                    name: 'English',
                    proficiency: 'Native'
                },
                {
                    id: 9,
                    name: 'Hindi',
                    proficiency: 'Fluent'
                },
                {
                    id: 10,
                    name: 'Telugu',
                    proficiency: 'Native'
                }
            ]
        };
        setData(sampleData);
        setExpandedItems({});
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 bg-slate-50 min-h-screen">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-heading">Resume Builder</h1>
                    <p className="text-slate-500">Create your professional resume in minutes</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadSampleData}
                        className="bg-white text-slate-700 border border-slate-200 px-6 py-2 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Fill Demo Data
                    </button>
                    <button
                        onClick={() => console.log(data)}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <FileText size={18} />
                        Export JSON
                    </button>
                </div>
            </header>

            {/* Contact Information */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <User size={20} className="text-slate-600" />
                    <h2 className="font-bold text-slate-800">Contact Information</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Full Name*</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={data.contact.fullName}
                            onChange={(e) => updateContact('fullName', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Email*</label>
                        <input
                            type="email"
                            placeholder="john@example.com"
                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={data.contact.email}
                            onChange={(e) => updateContact('email', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Phone*</label>
                        <input
                            type="text"
                            placeholder="+1 (555) 000-0000"
                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={data.contact.phone}
                            onChange={(e) => updateContact('phone', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Location</label>
                        <input
                            type="text"
                            placeholder="New York, NY"
                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={data.contact.location}
                            onChange={(e) => updateContact('location', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">LinkedIn</label>
                        <input
                            type="text"
                            placeholder="linkedin.com/in/johndoe"
                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={data.contact.linkedin}
                            onChange={(e) => updateContact('linkedin', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">GitHub</label>
                        <input
                            type="text"
                            placeholder="github.com/johndoe"
                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={data.contact.github}
                            onChange={(e) => updateContact('github', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Portfolio</label>
                        <input
                            type="text"
                            placeholder="johndoe.com"
                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={data.contact.portfolio}
                            onChange={(e) => updateContact('portfolio', e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* Professional Summary */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <FileText size={20} className="text-slate-600" />
                    <h2 className="font-bold text-slate-800">Professional Summary</h2>
                </div>
                <div className="p-6">
                    <textarea
                        rows={4}
                        placeholder="Write a brief professional summary about yourself..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        value={data.summary}
                        onChange={(e) => setData(prev => ({ ...prev, summary: e.target.value }))}
                    />
                </div>
            </section>

            {/* Work Experience */}
            <SectionWrapper
                title="Work Experience"
                icon={<Briefcase size={20} />}
                onAdd={() => addItem('experience', {
                    position: '',
                    company: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    current: false,
                    description: '',
                    achievements: []
                })}
            >
                {data.experience.map((item) => (
                    <CollapsibleItem
                        key={item.id}
                        title={item.position || "Untitled Position"}
                        subtitle={item.company ? `${item.company} | ${item.startDate || 'Start'} - ${item.current ? 'Present' : item.endDate || 'End'}` : "Company Name"}
                        isExpanded={expandedItems[`experience-${item.id}`]}
                        onToggle={() => toggleExpand('experience', item.id)}
                        onRemove={() => removeItem('experience', item.id)}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            <InputGroup label="Position*" value={item.position} onChange={(v) => updateItem('experience', item.id, 'position', v)} placeholder="Senior Software Engineer" />
                            <InputGroup label="Company*" value={item.company} onChange={(v) => updateItem('experience', item.id, 'company', v)} placeholder="Google" />
                            <InputGroup label="Location" value={item.location} onChange={(v) => updateItem('experience', item.id, 'location', v)} placeholder="Mountain View, CA" />
                            <div className="grid grid-cols-2 gap-2">
                                <InputGroup label="Start Date" value={item.startDate} onChange={(v) => updateItem('experience', item.id, 'startDate', v)} placeholder="MM/YYYY" />
                                <InputGroup label="End Date" value={item.endDate} onChange={(v) => updateItem('experience', item.id, 'endDate', v)} placeholder="MM/YYYY" disabled={item.current} />
                            </div>
                            <div className="md:col-span-2 flex items-center gap-2 py-2">
                                <input
                                    type="checkbox"
                                    id={`current-${item.id}`}
                                    checked={item.current}
                                    onChange={(e) => updateItem('experience', item.id, 'current', e.target.checked)}
                                    className="rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor={`current-${item.id}`} className="text-sm font-medium text-slate-700">I currently work here</label>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    value={item.description}
                                    onChange={(e) => updateItem('experience', item.id, 'description', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Key Achievements</label>
                                    <button
                                        onClick={() => addNestedItem('experience', item.id, 'achievements')}
                                        className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                                    >
                                        <Plus size={14} /> Add Achievement
                                    </button>
                                </div>
                                {item.achievements?.map((ach, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary"
                                            value={ach}
                                            onChange={(e) => updateNestedItem('experience', item.id, 'achievements', idx, e.target.value)}
                                            placeholder="Reduced latency by 40%..."
                                        />
                                        <button onClick={() => removeNestedItem('experience', item.id, 'achievements', idx)} className="text-slate-400 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CollapsibleItem>
                ))}
            </SectionWrapper>

            {/* Projects */}
            <SectionWrapper
                title="Projects"
                icon={<Code size={20} />}
                onAdd={() => addItem('projects', {
                    name: '',
                    description: '',
                    technologies: '',
                    link: '',
                    highlights: []
                })}
            >
                {data.projects.map((item) => (
                    <CollapsibleItem
                        key={item.id}
                        title={item.name || "Untitled Project"}
                        subtitle={item.technologies || "Technologies used"}
                        isExpanded={expandedItems[`projects-${item.id}`]}
                        onToggle={() => toggleExpand('projects', item.id)}
                        onRemove={() => removeItem('projects', item.id)}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            <InputGroup label="Project Name*" value={item.name} onChange={(v) => updateItem('projects', item.id, 'name', v)} placeholder="Resume Builder AI" />
                            <InputGroup label="Project Link" value={item.link} onChange={(v) => updateItem('projects', item.id, 'link', v)} placeholder="github.com/user/repo" />
                            <div className="md:col-span-2">
                                <InputGroup label="Technologies (comma-separated)*" value={item.technologies} onChange={(v) => updateItem('projects', item.id, 'technologies', v)} placeholder="React, Tailwind, Node.js" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Description*</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    value={item.description}
                                    onChange={(e) => updateItem('projects', item.id, 'description', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Key Highlights</label>
                                    <button
                                        onClick={() => addNestedItem('projects', item.id, 'highlights')}
                                        className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                                    >
                                        <Plus size={14} /> Add Highlight
                                    </button>
                                </div>
                                {item.highlights?.map((h, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary"
                                            value={h}
                                            onChange={(e) => updateNestedItem('projects', item.id, 'highlights', idx, e.target.value)}
                                        />
                                        <button onClick={() => removeNestedItem('projects', item.id, 'highlights', idx)} className="text-slate-400 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CollapsibleItem>
                ))}
            </SectionWrapper>

            {/* Skills */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <CheckCircle size={20} className="text-slate-600" />
                    <h2 className="font-bold text-slate-800">Skills</h2>
                </div>
                <div className="p-6">
                    <textarea
                        rows={4}
                        placeholder="E.g. JavaScript, React, Node.js, Project Management, Agile, SQL..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        value={data.skills}
                        onChange={(e) => setData(prev => ({ ...prev, skills: e.target.value }))}
                    />
                    <p className="text-xs text-slate-400 mt-2 italic">Separate skills with commas for better formatting in the resume.</p>
                </div>
            </section>

            {/* Certifications */}
            <SectionWrapper
                title="Certifications"
                icon={<Award size={20} />}
                onAdd={() => addItem('certifications', {
                    name: '',
                    organization: '',
                    date: '',
                    id: '',
                    url: ''
                })}
            >
                {data.certifications.map((item) => (
                    <CollapsibleItem
                        key={item.id}
                        title={item.name || "Untitled Certification"}
                        subtitle={item.organization || "Issuing Organization"}
                        isExpanded={expandedItems[`certifications-${item.id}`]}
                        onToggle={() => toggleExpand('certifications', item.id)}
                        onRemove={() => removeItem('certifications', item.id)}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            <InputGroup label="Certification Name*" value={item.name} onChange={(v) => updateItem('certifications', item.id, 'name', v)} placeholder="AWS Solutions Architect" />
                            <InputGroup label="Issuing Organization*" value={item.organization} onChange={(v) => updateItem('certifications', item.id, 'organization', v)} placeholder="Amazon Web Services" />
                            <InputGroup label="Date Issued" value={item.date} onChange={(v) => updateItem('certifications', item.id, 'date', v)} placeholder="MM/YYYY" />
                            <InputGroup label="Credential ID" value={item.id} onChange={(v) => updateItem('certifications', item.id, 'id', v)} placeholder="ABC-123-XYZ" />
                            <div className="md:col-span-2">
                                <InputGroup label="Credential URL" value={item.url} onChange={(v) => updateItem('certifications', item.id, 'url', v)} placeholder="https://verify.org/id" />
                            </div>
                        </div>
                    </CollapsibleItem>
                ))}
            </SectionWrapper>

            {/* Education */}
            <SectionWrapper
                title="Education"
                icon={<GraduationCap size={20} />}
                onAdd={() => addItem('education', {
                    degree: '',
                    institution: '',
                    location: '',
                    startYear: '',
                    endYear: '',
                    description: ''
                })}
            >
                {data.education.map((item) => (
                    <CollapsibleItem
                        key={item.id}
                        title={item.degree || "Untitled Degree"}
                        subtitle={item.institution || "Institution Name"}
                        isExpanded={expandedItems[`education-${item.id}`]}
                        onToggle={() => toggleExpand('education', item.id)}
                        onRemove={() => removeItem('education', item.id)}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            <InputGroup label="Degree*" value={item.degree} onChange={(v) => updateItem('education', item.id, 'degree', v)} placeholder="B.S. in Computer Science" />
                            <InputGroup label="Institution*" value={item.institution} onChange={(v) => updateItem('education', item.id, 'institution', v)} placeholder="Stanford University" />
                            <InputGroup label="Location" value={item.location} onChange={(v) => updateItem('education', item.id, 'location', v)} placeholder="Stanford, CA" />
                            <div className="grid grid-cols-2 gap-2">
                                <InputGroup label="Start Year" value={item.startYear} onChange={(v) => updateItem('education', item.id, 'startYear', v)} placeholder="2018" />
                                <InputGroup label="End Year" value={item.endYear} onChange={(v) => updateItem('education', item.id, 'endYear', v)} placeholder="2022" />
                            </div>
                            <div className="md:col-span-2">
                                <InputGroup label="Description" value={item.description} onChange={(v) => updateItem('education', item.id, 'description', v)} placeholder="GPA 3.9, Relevant coursework..." />
                            </div>
                        </div>
                    </CollapsibleItem>
                ))}
            </SectionWrapper>

            {/* Awards */}
            <SectionWrapper
                title="Achievements / Awards"
                icon={<Trophy size={20} />}
                onAdd={() => addItem('awards', {
                    title: '',
                    description: '',
                    date: ''
                })}
            >
                {data.awards.map((item) => (
                    <CollapsibleItem
                        key={item.id}
                        title={item.title || "Untitled Award"}
                        subtitle={item.date || "Date Received"}
                        isExpanded={expandedItems[`awards-${item.id}`]}
                        onToggle={() => toggleExpand('awards', item.id)}
                        onRemove={() => removeItem('awards', item.id)}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            <InputGroup label="Title*" value={item.title} onChange={(v) => updateItem('awards', item.id, 'title', v)} placeholder="Employee of the Month" />
                            <InputGroup label="Date" value={item.date} onChange={(v) => updateItem('awards', item.id, 'date', v)} placeholder="May 2023" />
                            <div className="md:col-span-2">
                                <InputGroup label="Description" value={item.description} onChange={(v) => updateItem('awards', item.id, 'description', v)} placeholder="Recognized for outstanding contribution to project X" />
                            </div>
                        </div>
                    </CollapsibleItem>
                ))}
            </SectionWrapper>

            {/* Hackathons */}
            <SectionWrapper
                title="Hackathons / Competitions"
                icon={<Globe size={20} />}
                onAdd={() => addItem('hackathons', {
                    name: '',
                    result: '',
                    date: '',
                    description: ''
                })}
            >
                {data.hackathons.map((item) => (
                    <CollapsibleItem
                        key={item.id}
                        title={item.name || "Untitled Event"}
                        subtitle={item.result || "Result / Role"}
                        isExpanded={expandedItems[`hackathons-${item.id}`]}
                        onToggle={() => toggleExpand('hackathons', item.id)}
                        onRemove={() => removeItem('hackathons', item.id)}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            <InputGroup label="Event Name*" value={item.name} onChange={(v) => updateItem('hackathons', item.id, 'name', v)} placeholder="ETHGlobal Waterloo" />
                            <InputGroup label="Result" value={item.result} onChange={(v) => updateItem('hackathons', item.id, 'result', v)} placeholder="1st Place / Finalist" />
                            <InputGroup label="Date" value={item.date} onChange={(v) => updateItem('hackathons', item.id, 'date', v)} placeholder="June 2024" />
                            <div className="md:col-span-2">
                                <InputGroup label="Description" value={item.description} onChange={(v) => updateItem('hackathons', item.id, 'description', v)} placeholder="Developed a DeFi protocol using Solidity..." />
                            </div>
                        </div>
                    </CollapsibleItem>
                ))}
            </SectionWrapper>

            {/* Languages */}
            <SectionWrapper
                title="Languages"
                icon={<Languages size={20} />}
                onAdd={() => addItem('languages', {
                    name: '',
                    proficiency: 'Fluent'
                })}
            >
                {data.languages.map((item) => (
                    <CollapsibleItem
                        key={item.id}
                        title={item.name || "Untitled Language"}
                        subtitle={item.proficiency}
                        isExpanded={expandedItems[`languages-${item.id}`]}
                        onToggle={() => toggleExpand('languages', item.id)}
                        onRemove={() => removeItem('languages', item.id)}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            <InputGroup label="Language Name*" value={item.name} onChange={(v) => updateItem('languages', item.id, 'name', v)} placeholder="English" />
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Proficiency</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    value={item.proficiency}
                                    onChange={(e) => updateItem('languages', item.id, 'proficiency', e.target.value)}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Fluent">Fluent</option>
                                    <option value="Native">Native</option>
                                </select>
                            </div>
                        </div>
                    </CollapsibleItem>
                ))}
            </SectionWrapper>

            {/* Publications */}
            <SectionWrapper
                title="Publications"
                icon={<FileText size={20} />}
                onAdd={() => addItem('publications', {
                    title: '',
                    authors: '',
                    journal: '',
                    date: '',
                    link: ''
                })}
            >
                {data.publications.map((item) => (
                    <CollapsibleItem
                        key={item.id}
                        title={item.title || "Untitled Publication"}
                        subtitle={item.journal || "Journal / Conference"}
                        isExpanded={expandedItems[`publications-${item.id}`]}
                        onToggle={() => toggleExpand('publications', item.id)}
                        onRemove={() => removeItem('publications', item.id)}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            <InputGroup label="Title*" value={item.title} onChange={(v) => updateItem('publications', item.id, 'title', v)} placeholder="Scalable Systems Design" />
                            <InputGroup label="Authors" value={item.authors} onChange={(v) => updateItem('publications', item.id, 'authors', v)} placeholder="S. Nadukuda, et al." />
                            <InputGroup label="Journal / Conference" value={item.journal} onChange={(v) => updateItem('publications', item.id, 'journal', v)} placeholder="IEEE Software" />
                            <InputGroup label="Date" value={item.date} onChange={(v) => updateItem('publications', item.id, 'date', v)} placeholder="2023" />
                            <div className="md:col-span-2">
                                <InputGroup label="Publication Link" value={item.link} onChange={(v) => updateItem('publications', item.id, 'link', v)} placeholder="https://doi.org/..." />
                            </div>
                        </div>
                    </CollapsibleItem>
                ))}
            </SectionWrapper>

            {/* Teaching */}
            <SectionWrapper
                title="Teaching Experience"
                icon={<Briefcase size={20} />}
                onAdd={() => addItem('teaching', {
                    role: '',
                    course: '',
                    institution: '',
                    date: '',
                    description: ''
                })}
            >
                {data.teaching.map((item) => (
                    <CollapsibleItem
                        key={item.id}
                        title={item.role || "Untitled Role"}
                        subtitle={item.course || "Course Name"}
                        isExpanded={expandedItems[`teaching-${item.id}`]}
                        onToggle={() => toggleExpand('teaching', item.id)}
                        onRemove={() => removeItem('teaching', item.id)}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            <InputGroup label="Role*" value={item.role} onChange={(v) => updateItem('teaching', item.id, 'role', v)} placeholder="Teaching Assistant" />
                            <InputGroup label="Course" value={item.course} onChange={(v) => updateItem('teaching', item.id, 'course', v)} placeholder="CS101" />
                            <InputGroup label="Institution" value={item.institution} onChange={(v) => updateItem('teaching', item.id, 'institution', v)} placeholder="Stanford University" />
                            <InputGroup label="Date" value={item.date} onChange={(v) => updateItem('teaching', item.id, 'date', v)} placeholder="2021-2022" />
                            <div className="md:col-span-2">
                                <InputGroup label="Description" value={item.description} onChange={(v) => updateItem('teaching', item.id, 'description', v)} placeholder="Taught lab sessions for 50 students..." />
                            </div>
                        </div>
                    </CollapsibleItem>
                ))}
            </SectionWrapper>

            {/* Extracurricular */}
            <SectionWrapper
                title="Extracurricular Activities"
                icon={<Globe size={20} />}
                onAdd={() => addItem('extracurricular', {
                    activity: '',
                    role: '',
                    date: '',
                    description: ''
                })}
            >
                {data.extracurricular.map((item) => (
                    <CollapsibleItem
                        key={item.id}
                        title={item.activity || "Untitled Activity"}
                        subtitle={item.role || "Role"}
                        isExpanded={expandedItems[`extracurricular-${item.id}`]}
                        onToggle={() => toggleExpand('extracurricular', item.id)}
                        onRemove={() => removeItem('extracurricular', item.id)}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            <InputGroup label="Activity*" value={item.activity} onChange={(v) => updateItem('extracurricular', item.id, 'activity', v)} placeholder="Debating Club" />
                            <InputGroup label="Role" value={item.role} onChange={(v) => updateItem('extracurricular', item.id, 'role', v)} placeholder="President" />
                            <InputGroup label="Date" value={item.date} onChange={(v) => updateItem('extracurricular', item.id, 'date', v)} placeholder="2020-2022" />
                            <div className="md:col-span-2">
                                <InputGroup label="Description" value={item.description} onChange={(v) => updateItem('extracurricular', item.id, 'description', v)} placeholder="Led the team to win regional championship..." />
                            </div>
                        </div>
                    </CollapsibleItem>
                ))}
            </SectionWrapper>

            {/* Skill Matcher */}
            <SkillMatcher userSkills={data.skills} />

            <footer className="text-center py-12 border-t border-slate-200 text-slate-400 text-sm">
                <p>© 2026 Professional Resume Builder. All rights reserved.</p>
            </footer>
        </div>
    );
}

// Sub-components for cleaner structure

function SectionWrapper({ title, icon, onAdd, children }) {
    return (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <h2 className="font-bold text-slate-800">{title}</h2>
                </div>
                <button
                    onClick={onAdd}
                    className="text-white bg-primary p-1.5 rounded-full hover:scale-105 transition-transform"
                    title={`Add ${title} item`}
                >
                    <Plus size={18} />
                </button>
            </div>
            <div className="p-4 space-y-4">
                {children.length > 0 ? children : (
                    <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                        No items added yet. Click the + button to add your first {title.toLowerCase()}.
                    </div>
                )}
            </div>
        </section>
    );
}

function CollapsibleItem({ title, subtitle, isExpanded, onToggle, onRemove, children }) {
    return (
        <div className={cn(
            "border rounded-lg transition-all",
            isExpanded ? "border-primary shadow-md" : "border-slate-100 hover:border-slate-300"
        )}>
            <div className="p-4 flex items-center justify-between cursor-pointer select-none" onClick={onToggle}>
                <div className="flex-1 min-w-0 pr-4">
                    <h3 className={cn("font-bold text-slate-800 truncate", isExpanded && "text-primary")}>{title}</h3>
                    <p className="text-sm text-slate-500 truncate">{subtitle}</p>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={onRemove}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={onToggle}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-md"
                    >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-slate-100 bg-white animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}

function InputGroup({ label, value, onChange, placeholder, disabled = false, type = "text" }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm",
                    disabled && "bg-slate-50 text-slate-400 cursor-not-allowed"
                )}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
