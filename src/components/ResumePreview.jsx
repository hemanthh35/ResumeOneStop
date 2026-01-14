import React from 'react';
import { Github, Linkedin, Globe, Mail, Phone } from 'lucide-react';

const ResumePreview = ({ data, selectedTemplate, setSelectedTemplate }) => {
    const templates = [
        { id: 'template-1', name: 'ATS Classic', description: 'Simple, single-column, B&W' },
        { id: 'template-2', name: 'SimpleCV LaTeX', description: 'Exact LaTeX replica with serif typography' },
        { id: 'template-3', name: 'SimpleCV Academic', description: 'Indigo-themed academic LaTeX style' },
        { id: 'template-4', name: 'Creative Compact', description: 'Stylish header, compact' },
    ];

    React.useEffect(() => {
        if (data.contact.fullName) {
            document.title = `${data.contact.fullName}_Resume`;
        }
    }, [data.contact.fullName]);

    return (
        <div className="flex flex-col md:flex-row h-full">
            {/* Template Selector Sidebar */}
            <div className="w-full md:w-80 bg-white border-r border-slate-200 p-6 space-y-4 overflow-y-auto no-print">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Choose Template</h3>
                <div className="space-y-3">
                    {templates.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedTemplate(t.id)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTemplate === t.id
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <div className="font-bold text-slate-900">{t.name}</div>
                            <div className="text-xs text-slate-500 mt-1">{t.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Resume Preview Area */}
            <div className="flex-1 bg-slate-100 p-8 overflow-y-auto preview-container">
                <div className="max-w-[210mm] mx-auto shadow-2xl rounded-sm">
                    <div id="resume-to-print" className="bg-white resume-paper printable-content">
                        {selectedTemplate === 'template-1' && <ATSClassic data={data} />}
                        {selectedTemplate === 'template-2' && <ModernProfessional data={data} />}
                        {selectedTemplate === 'template-3' && <MinimalElegant data={data} />}
                        {selectedTemplate === 'template-4' && <CreativeCompact data={data} />}
                    </div>
                </div>
            </div>

            <style>{`
        .resume-paper {
          border-radius: 0;
        }
        
        @media print {
          .no-print, .sidebar, header, nav { 
            display: none !important; 
          }
          .preview-container { 
            padding: 0 !important; 
            margin: 0 !important; 
            overflow: visible !important; 
            background: white !important;
            height: auto !important;
          }
          .resume-paper { 
            box-shadow: none !important; 
            margin: 0 !important; 
            width: 100% !important; 
            max-width: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
          }
          body { 
            margin: 0 !important; 
            padding: 0 !important; 
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page { 
            size: auto; 
            margin: 0mm; 
          }
          section {
            page-break-inside: avoid;
          }
        }
      `}</style>
        </div>
    );
};

/* --- TEMPLATE 1: ATS CLASSIC (EXACT REPLICA) --- */
const ATSClassic = ({ data }) => {
    const styles = `
    .ats-resume { 
      font-family: 'Times New Roman', Times, serif; 
      color: #000; 
      padding: 10mm 12mm; 
      line-height: 1.35; 
      font-size: 10pt; 
      background: white;
      min-height: 297mm;
    }
    .ats-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .ats-name {
      font-size: 24pt;
      font-weight: bold;
      margin: 0;
    }
    .ats-contact {
      text-align: right;
      font-size: 9pt;
      line-height: 1.5;
    }
    .ats-contact a {
      color: #0000EE;
      text-decoration: none;
    }
    .ats-section-title {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
      margin-top: 12px;
      margin-bottom: 6px;
    }
    .ats-edu-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .ats-edu-left {
      flex: 1;
    }
    .ats-edu-right {
      text-align: right;
      white-space: nowrap;
    }
    .ats-skill-row {
      display: flex;
      margin-bottom: 2px;
    }
    .ats-skill-label {
      font-weight: bold;
      min-width: 90px;
      flex-shrink: 0;
    }
    .ats-exp-header {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      margin-bottom: 1px;
    }
    .ats-exp-sub {
      display: flex;
      justify-content: space-between;
      font-style: italic;
      margin-bottom: 3px;
      font-size: 9.5pt;
    }
    .ats-bullet {
      display: flex;
      gap: 6px;
      margin-bottom: 2px;
      text-align: justify;
    }
    .ats-bullet-symbol {
      flex-shrink: 0;
    }
    .ats-project-title {
      font-weight: bold;
    }
    .ats-project-tech {
      font-weight: normal;
    }
    .ats-item {
      margin-bottom: 8px;
    }
    .ats-award-item {
      display: flex;
      margin-bottom: 2px;
    }
    .ats-courses {
      font-size: 9pt;
      font-style: italic;
      margin-top: 2px;
    }
  `;

    // Parse skills into categories if possible
    const skillCategories = data.skills ? {
        'Languages': data.skills.split(',').slice(0, 5).map(s => s.trim()).join(', '),
        'Frameworks': data.skills.split(',').slice(5, 10).map(s => s.trim()).join(', '),
        'Tools': data.skills.split(',').slice(10, 14).map(s => s.trim()).join(', '),
    } : {};

    return (
        <div className="ats-resume">
            <style>{styles}</style>

            {/* Header */}
            <div className="ats-header">
                <div className="ats-name">{data.contact.fullName || 'Your Name'}</div>
                <div className="ats-contact">
                    {data.contact.email && <div><strong>Email:</strong> <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a></div>}
                    {data.contact.phone && <div><strong>Mobile:</strong> {data.contact.phone}</div>}
                    {data.contact.portfolio && <div><strong>Portfolio:</strong> <a href={data.contact.portfolio}>{data.contact.portfolio.replace(/^https?:\/\//, '')}</a></div>}
                    {data.contact.github && <div><strong>Github:</strong> <a href={data.contact.github}>{data.contact.github.replace(/^https?:\/\//, '')}</a></div>}
                </div>
            </div>

            {/* Education */}
            {data.education.length > 0 && (
                <section>
                    <div className="ats-section-title">Education</div>
                    {data.education.map(edu => (
                        <div key={edu.id}>
                            <div className="ats-edu-item">
                                <div className="ats-edu-left"><strong>{edu.institution}</strong></div>
                                <div className="ats-edu-right">{edu.location}</div>
                            </div>
                            <div className="ats-edu-item">
                                <div className="ats-edu-left"><em>{edu.degree}</em>{edu.description && ` - ${edu.description}`}</div>
                                <div className="ats-edu-right"><em>{edu.startYear} - {edu.endYear}</em></div>
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {/* Skills Summary */}
            {data.skills && (
                <section>
                    <div className="ats-section-title">Skills Summary</div>
                    <div className="ats-skill-row">
                        <span className="ats-skill-label">○ Languages:</span>
                        <span>{skillCategories['Languages'] || data.skills.split(',').slice(0, 5).join(', ')}</span>
                    </div>
                    <div className="ats-skill-row">
                        <span className="ats-skill-label">○ Frameworks:</span>
                        <span>{skillCategories['Frameworks'] || data.skills.split(',').slice(5, 10).join(', ')}</span>
                    </div>
                    <div className="ats-skill-row">
                        <span className="ats-skill-label">○ Tools:</span>
                        <span>{skillCategories['Tools'] || data.skills.split(',').slice(10).join(', ')}</span>
                    </div>
                    {data.languages?.length > 0 && (
                        <div className="ats-skill-row">
                            <span className="ats-skill-label">○ Soft Skills:</span>
                            <span>Leadership, Event Management, Writing, Public Speaking, Time Management</span>
                        </div>
                    )}
                </section>
            )}

            {/* Experience */}
            {data.experience.length > 0 && (
                <section>
                    <div className="ats-section-title">Experience</div>
                    {data.experience.map(exp => (
                        <div key={exp.id} className="ats-item">
                            <div className="ats-exp-header">
                                <span>{exp.company}</span>
                                <span>{exp.location}</span>
                            </div>
                            <div className="ats-exp-sub">
                                <span>{exp.position}</span>
                                <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                            </div>
                            {exp.description && (
                                <div className="ats-bullet">
                                    <span className="ats-bullet-symbol">○</span>
                                    <span>{exp.description}</span>
                                </div>
                            )}
                            {exp.achievements?.map((a, i) => (
                                <div key={i} className="ats-bullet">
                                    <span className="ats-bullet-symbol">○</span>
                                    <span>{a}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </section>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
                <section>
                    <div className="ats-section-title">Projects</div>
                    {data.projects.map(proj => (
                        <div key={proj.id} className="ats-item">
                            <div className="ats-bullet">
                                <span className="ats-bullet-symbol">•</span>
                                <span>
                                    <span className="ats-project-title">{proj.name}</span>
                                    {proj.technologies && <span className="ats-project-tech"> ({proj.technologies})</span>}
                                    : {proj.description}
                                </span>
                            </div>
                            {proj.highlights?.map((h, i) => (
                                <div key={i} className="ats-bullet" style={{ marginLeft: '15px' }}>
                                    <span className="ats-bullet-symbol">-</span>
                                    <span>{h}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </section>
            )}

            {/* Publications */}
            {data.publications?.length > 0 && (
                <section>
                    <div className="ats-section-title">Publications</div>
                    {data.publications.map(pub => (
                        <div key={pub.id} className="ats-bullet">
                            <span className="ats-bullet-symbol">•</span>
                            <span>
                                <strong>{pub.title}</strong>: {pub.authors}. <em>{pub.journal}</em> ({pub.date}).
                            </span>
                        </div>
                    ))}
                </section>
            )}

            {/* Honors and Awards */}
            {(data.awards?.length > 0 || data.hackathons?.length > 0) && (
                <section>
                    <div className="ats-section-title">Honors and Awards</div>
                    {data.awards?.map(a => (
                        <div key={a.id} className="ats-bullet">
                            <span className="ats-bullet-symbol">•</span>
                            <span>{a.title} - {a.description} ({a.date})</span>
                        </div>
                    ))}
                    {data.hackathons?.map(h => (
                        <div key={h.id} className="ats-bullet">
                            <span className="ats-bullet-symbol">•</span>
                            <span>{h.name} - {h.result}: {h.description} ({h.date})</span>
                        </div>
                    ))}
                </section>
            )}

            {/* Volunteer Experience / Extra */}
            {data.certifications?.length > 0 && (
                <section>
                    <div className="ats-section-title">Volunteer Experience</div>
                    {data.certifications.map(cert => (
                        <div key={cert.id} className="ats-item">
                            <div className="ats-exp-header">
                                <span>{cert.name}</span>
                                <span>{cert.organization}</span>
                            </div>
                            <div className="ats-exp-sub">
                                <span><em>{cert.date}</em></span>
                            </div>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
};

/* --- TEMPLATE 2: SIMPLECV LATEX (EXACT REPLICA) --- */
const ModernProfessional = ({ data }) => {
    const themeColor = '#191970';
    const styles = `
    .latex-template { 
      font-family: 'Times New Roman', Times, serif; 
      padding: 15mm 15mm; 
      color: #000; 
      line-height: 1.3; 
      font-size: 11pt; 
      background: white;
      min-height: 297mm;
    }
    .latex-header {
      text-align: center;
      margin-bottom: 25px;
    }
    .latex-name {
      font-size: 32pt;
      font-weight: normal;
      margin-bottom: 10px;
    }
    .latex-contact {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      font-size: 9pt;
      color: ${themeColor};
    }
    .latex-contact a {
      color: ${themeColor};
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .latex-divider {
      color: #999;
      font-weight: normal;
    }
    .latex-section-title {
      font-variant: small-caps;
      font-size: 14pt;
      font-weight: normal;
      margin-top: 15px;
      margin-bottom: 2px;
    }
    .latex-hr {
      border: 0;
      border-top: 0.5pt solid #000;
      margin-bottom: 8px;
    }
    .latex-item {
      margin-bottom: 10px;
    }
    .latex-item-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-weight: bold;
    }
    .latex-date {
      font-weight: normal;
      color: #333;
    }
    .latex-bullets {
      margin-left: 15px;
      margin-top: 4px;
    }
    .latex-bullet {
      display: flex;
      gap: 8px;
      margin-bottom: 2px;
    }
    .latex-bullet-symbol {
      flex-shrink: 0;
    }
    .latex-edu-row {
      display: grid;
      grid-template-columns: 100px 1fr 120px;
      gap: 10px;
      margin-bottom: 5px;
    }
    .latex-skill-row {
      display: grid;
      grid-template-columns: 140px 1fr;
      margin-bottom: 4px;
    }
    .latex-footer {
      text-align: center;
      font-size: 9pt;
      color: #666;
      margin-top: 40px;
      font-style: italic;
    }
  `;

    const getCleanUrl = (url) => url?.replace(/^https?:\/\/(www\.)?/, '');

    return (
        <div className="latex-template">
            <style>{styles}</style>

            <header className="latex-header">
                <div className="latex-name">{data.contact.fullName || 'Your Name'}</div>
                <div className="latex-contact">
                    {data.contact.github && (
                        <><a href={data.contact.github}><Github size={12} /> {getCleanUrl(data.contact.github)}</a><span className="latex-divider">|</span></>
                    )}
                    {data.contact.linkedin && (
                        <><a href={data.contact.linkedin}><Linkedin size={12} /> {getCleanUrl(data.contact.linkedin)}</a><span className="latex-divider">|</span></>
                    )}
                    {data.contact.portfolio && (
                        <><a href={data.contact.portfolio}><Globe size={12} /> {getCleanUrl(data.contact.portfolio)}</a><span className="latex-divider">|</span></>
                    )}
                    {data.contact.email && (
                        <><a href={`mailto:${data.contact.email}`}><Mail size={12} /> {data.contact.email}</a><span className="latex-divider">|</span></>
                    )}
                    {data.contact.phone && (
                        <a href={`tel:${data.contact.phone.replace(/\s/g, '')}`}><Phone size={12} /> {data.contact.phone}</a>
                    )}
                </div>
            </header>

            {data.summary && (
                <section>
                    <div className="latex-section-title">Summary</div>
                    <hr className="latex-hr" />
                    <div style={{ textAlign: 'justify' }}>{data.summary}</div>
                </section>
            )}

            {data.experience.length > 0 && (
                <section>
                    <div className="latex-section-title">Work Experience</div>
                    <hr className="latex-hr" />
                    {data.experience.map(exp => (
                        <div key={exp.id} className="latex-item">
                            <div className="latex-item-row">
                                <span>{exp.position}</span>
                                <span className="latex-date">{exp.startDate} – {exp.current ? 'present' : exp.endDate}</span>
                            </div>
                            <div style={{ fontStyle: 'italic', marginBottom: '2px' }}>{exp.company} &bull; {exp.location}</div>
                            <div className="latex-bullets">
                                {exp.description && <div className="latex-bullet"><span className="latex-bullet-symbol">-</span><span>{exp.description}</span></div>}
                                {exp.achievements?.map((a, i) => (
                                    <div key={i} className="latex-bullet"><span className="latex-bullet-symbol">-</span><span>{a}</span></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {data.projects.length > 0 && (
                <section>
                    <div className="latex-section-title">Projects</div>
                    <hr className="latex-hr" />
                    {data.projects.map(proj => (
                        <div key={proj.id} className="latex-item">
                            <div className="latex-item-row">
                                <span>{proj.name}</span>
                                {proj.link && <a href={proj.link} style={{ color: themeColor, fontStyle: 'italic', fontWeight: 'normal' }}>Link to Demo</a>}
                            </div>
                            <div style={{ textAlign: 'justify' }}>{proj.description}</div>
                        </div>
                    ))}
                </section>
            )}

            {data.education.length > 0 && (
                <section>
                    <div className="latex-section-title">Education</div>
                    <hr className="latex-hr" />
                    {data.education.map(edu => (
                        <div key={edu.id} className="latex-edu-row">
                            <div className="latex-date">{edu.startYear} – {edu.endYear}</div>
                            <div><strong>{edu.degree}</strong> ({edu.institution})</div>
                            <div style={{ textAlign: 'right' }}>{edu.description.includes('GPA') ? edu.description : `(GPA: ${edu.description || '4.0/4.0'})`}</div>
                        </div>
                    ))}
                </section>
            )}

            {data.publications?.length > 0 && (
                <section>
                    <div className="latex-section-title">Publications</div>
                    <hr className="latex-hr" />
                    {data.publications.map(pub => (
                        <div key={pub.id} className="latex-item" style={{ textAlign: 'justify' }}>
                            {pub.authors} ({pub.date}). &ldquo;{pub.title}&rdquo;. In: <em>{pub.journal}</em>. URL: <a href={pub.link || '#'} style={{ color: themeColor }}>{pub.link || 'link'}</a>
                        </div>
                    ))}
                </section>
            )}

            {(data.skills || data.languages.length > 0) && (
                <section>
                    <div className="latex-section-title">Skills</div>
                    <hr className="latex-hr" />
                    {data.skills && (
                        <div className="latex-skill-row">
                            <strong>Technical Skills</strong>
                            <span>{data.skills}</span>
                        </div>
                    )}
                    {data.languages.length > 0 && (
                        <div className="latex-skill-row">
                            <strong>Languages</strong>
                            <span>{data.languages.map(l => `${l.name} (${l.proficiency})`).join(', ')}</span>
                        </div>
                    )}
                </section>
            )}

            <footer className="latex-footer">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </footer>
        </div>
    );
};

/* --- TEMPLATE 3: SIMPLECV ACADEMIC --- */
const MinimalElegant = ({ data }) => {
    const themeColor = '#191970';
    const styles = `
    .simplecv { font-family: 'Times New Roman', Times, serif; padding: 15mm 20mm; color: #1a1a1a; line-height: 1.5; font-size: 11px; background: white; min-height: 297mm; }
    .simplecv .heading-inline { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid ${themeColor}; padding-bottom: 5px; margin-bottom: 20px; }
    .simplecv .name { font-size: 26px; font-weight: bold; color: ${themeColor}; letter-spacing: -0.2px; }
    .simplecv .contact-info { text-align: right; font-size: 9px; color: #333; line-height: 1.4; }
    .simplecv h2 { font-size: 12px; font-weight: bold; text-transform: uppercase; color: ${themeColor}; margin: 15px 0 6px 0; border-bottom: 1px solid #ddd; padding-bottom: 2px; }
    .simplecv .item { margin-bottom: 10px; }
    .simplecv .item-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 11px; }
    .simplecv .item-sub { display: flex; justify-content: space-between; font-style: italic; color: #444; font-size: 10px; margin-bottom: 3px; }
    .simplecv .bullet { display: flex; gap: 6px; margin-bottom: 2px; text-align: justify; }
    .simplecv .bullet-symbol { flex-shrink: 0; color: ${themeColor}; }
    .simplecv .side-by-side { display: flex; gap: 40px; margin-top: 5px; }
    .simplecv .side-by-side > div { flex: 1; }
  `;

    return (
        <div className="simplecv">
            <style>{styles}</style>
            <div className="heading-inline">
                <div className="name">{data.contact.fullName}</div>
                <div className="contact-info">
                    {data.contact.portfolio && <div>Website: {data.contact.portfolio.replace(/^https?:\/\//, '')}</div>}
                    <div>Email: {data.contact.email}</div>
                    {data.contact.linkedin && <div>LinkedIn: {data.contact.linkedin.split('/').pop()}</div>}
                    {data.contact.github && <div>GitHub: {data.contact.github.split('/').pop()}</div>}
                </div>
            </div>

            {data.summary && (
                <section>
                    <h2>Summary</h2>
                    <div style={{ textAlign: 'justify' }}>{data.summary}</div>
                </section>
            )}

            {data.education.length > 0 && (
                <section>
                    <h2>Education</h2>
                    {data.education.map(edu => (
                        <div key={edu.id} className="item">
                            <div className="item-header"><span>{edu.degree}</span><span>{edu.startYear} – {edu.endYear}</span></div>
                            <div className="item-sub"><span>{edu.institution}</span><span>{edu.location}</span></div>
                            {edu.description && <div style={{ fontSize: '9.5px' }}>{edu.description}</div>}
                        </div>
                    ))}
                </section>
            )}

            {data.experience.length > 0 && (
                <section>
                    <h2>Experience</h2>
                    {data.experience.map(exp => (
                        <div key={exp.id} className="item">
                            <div className="item-header"><span>{exp.position}</span><span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span></div>
                            <div className="item-sub"><span>{exp.company}</span><span>{exp.location}</span></div>
                            {exp.description && (
                                <div className="bullet"><span className="bullet-symbol">•</span><span>{exp.description}</span></div>
                            )}
                            {exp.achievements?.map((a, i) => (
                                <div key={i} className="bullet"><span className="bullet-symbol">•</span><span>{a}</span></div>
                            ))}
                        </div>
                    ))}
                </section>
            )}

            {data.projects.length > 0 && (
                <section>
                    <h2>Projects</h2>
                    {data.projects.map(proj => (
                        <div key={proj.id} className="item">
                            <div className="item-header">
                                <span>{proj.name}</span>
                                {proj.link && <a href={proj.link} style={{ color: themeColor, fontWeight: 'normal', fontSize: '9px' }}>{proj.link}</a>}
                            </div>
                            {proj.technologies && <div style={{ color: themeColor, fontSize: '9px', fontWeight: 'bold' }}>{proj.technologies}</div>}
                            <div style={{ textAlign: 'justify' }}>{proj.description}</div>
                            {proj.highlights?.map((h, i) => (
                                <div key={i} className="bullet"><span className="bullet-symbol">-</span><span>{h}</span></div>
                            ))}
                        </div>
                    ))}
                </section>
            )}

            {data.publications?.length > 0 && (
                <section>
                    <h2>Publications</h2>
                    {data.publications.map(pub => (
                        <div key={pub.id} className="bullet">
                            <span className="bullet-symbol">•</span>
                            <span>{pub.authors} ({pub.date}). "{pub.title}". <em>{pub.journal}</em>.</span>
                        </div>
                    ))}
                </section>
            )}

            <div className="side-by-side">
                {data.skills && (
                    <div>
                        <h2>Skills</h2>
                        <div style={{ color: '#222', textAlign: 'justify', fontSize: '10.5px' }}>{data.skills}</div>
                    </div>
                )}
                {data.languages.length > 0 && (
                    <div>
                        <h2>Languages</h2>
                        <div style={{ color: '#222', fontSize: '10.5px' }}>
                            {data.languages.map((l, i) => (
                                <span key={i}><strong>{l.name}</strong> ({l.proficiency}){i < data.languages.length - 1 ? ', ' : ''}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {(data.awards?.length > 0 || data.hackathons?.length > 0) && (
                <section>
                    <h2>Awards & Achievements</h2>
                    {data.awards?.map(a => (
                        <div key={a.id} className="bullet">
                            <span className="bullet-symbol">•</span>
                            <span><strong>{a.title}</strong> ({a.date}): {a.description}</span>
                        </div>
                    ))}
                    {data.hackathons?.map(h => (
                        <div key={h.id} className="bullet">
                            <span className="bullet-symbol">•</span>
                            <span><strong>{h.name}</strong> - {h.result} ({h.date}): {h.description}</span>
                        </div>
                    ))}
                </section>
            )}

            {data.certifications?.length > 0 && (
                <section>
                    <h2>Certifications</h2>
                    {data.certifications.map(cert => (
                        <div key={cert.id} className="bullet">
                            <span className="bullet-symbol">•</span>
                            <span><strong>{cert.name}</strong> - {cert.organization} ({cert.date})</span>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
};

/* --- TEMPLATE 4: CREATIVE COMPACT --- */
/* --- TEMPLATE 4: CREATIVE COMPACT --- */
const CreativeCompact = ({ data }) => {
    const styles = `
    .creative { font-family: 'Outfit', sans-serif; display: flex; min-height: 297mm; background: white; line-height: 1.5; font-size: 10px; }
    .creative .sidebar { width: 32%; background: #1e293b; color: white; padding: 12mm 8mm; }
    .creative .main { width: 68%; padding: 12mm 12mm; background: white; color: #334155; }
    .creative .initials { width: 50px; height: 50px; background: #3b82f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
    .creative h1 { font-size: 22px; font-weight: 800; line-height: 1.2; margin: 0 0 8px 0; }
    .creative .contact-info { font-size: 9px; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; }
    .creative .contact-item { display: flex; flex-direction: column; margin-bottom: 12px; }
    .creative .contact-label { font-size: 8px; text-transform: uppercase; color: #3b82f6; font-weight: 700; margin-bottom: 2px; }
    .creative .contact-value { opacity: 0.9; word-break: break-all; }
    .creative .sidebar-section { margin-top: 25px; }
    .creative .sidebar-h2 { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #3b82f6; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .creative .sidebar-h2::after { content: ""; flex: 1; height: 1px; background: rgba(255,255,255,0.1); }
    .creative .skill-tag { display: inline-block; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 6px; font-size: 8px; margin: 0 4px 4px 0; border: 1px solid rgba(255,255,255,0.05); }
    
    .creative .main-section { margin-bottom: 25px; }
    .creative h2 { font-size: 14px; font-weight: 800; color: #1e293b; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
    .creative h2::after { content: ""; flex: 1; height: 1px; background: #e2e8f0; }
    .creative .item { margin-bottom: 15px; }
    .creative .item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
    .creative .item-title { font-weight: 800; color: #1e293b; font-size: 11px; }
    .creative .item-date { font-size: 9px; color: #94a3b8; font-weight: 600; }
    .creative .item-sub { font-size: 10px; color: #3b82f6; font-weight: 700; margin-bottom: 6px; }
    .creative .bullet { display: flex; gap: 8px; margin-bottom: 4px; font-size: 9.5px; line-height: 1.4; color: #475569; }
    .creative .bullet::before { content: "•"; color: #3b82f6; font-weight: bold; }
  `;

    const initials = data.contact.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="creative">
            <style>{styles}</style>
            <div className="sidebar">
                <div className="initials">{initials || '??'}</div>
                <h1>{data.contact.fullName}</h1>

                <div className="contact-info">
                    {data.contact.email && (
                        <div className="contact-item">
                            <span className="contact-label">Email</span>
                            <span className="contact-value">{data.contact.email}</span>
                        </div>
                    )}
                    {data.contact.phone && (
                        <div className="contact-item">
                            <span className="contact-label">Phone</span>
                            <span className="contact-value">{data.contact.phone}</span>
                        </div>
                    )}
                    {data.contact.location && (
                        <div className="contact-item">
                            <span className="contact-label">Location</span>
                            <span className="contact-value">{data.contact.location}</span>
                        </div>
                    )}
                    {data.contact.linkedin && (
                        <div className="contact-item">
                            <span className="contact-label">LinkedIn</span>
                            <span className="contact-value">{data.contact.linkedin.split('/').pop()}</span>
                        </div>
                    )}
                </div>

                {data.skills && (
                    <div className="sidebar-section">
                        <div className="sidebar-h2">Skills</div>
                        <div className="flex flex-wrap">
                            {data.skills.split(',').map((s, i) => (
                                <span key={i} className="skill-tag">{s.trim()}</span>
                            ))}
                        </div>
                    </div>
                )}

                {data.languages?.length > 0 && (
                    <div className="sidebar-section">
                        <div className="sidebar-h2">Languages</div>
                        {data.languages.map((l, i) => (
                            <div key={i} className="mb-2">
                                <div style={{ fontSize: '9px', fontWeight: '700' }}>{l.name}</div>
                                <div style={{ fontSize: '8px', opacity: 0.7 }}>{l.proficiency}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="main">
                {data.summary && (
                    <section className="main-section">
                        <h2>Summary</h2>
                        <p style={{ color: '#475569', fontSize: '10px', lineHeight: '1.6' }}>{data.summary}</p>
                    </section>
                )}

                {data.experience.length > 0 && (
                    <section className="main-section">
                        <h2>Experience</h2>
                        {data.experience.map(exp => (
                            <div key={exp.id} className="item">
                                <div className="item-header">
                                    <span className="item-title">{exp.position}</span>
                                    <span className="item-date">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                                </div>
                                <div className="item-sub">{exp.company}{exp.location && ` • ${exp.location}`}</div>
                                {exp.description && <div className="bullet">{exp.description}</div>}
                                {exp.achievements?.map((a, i) => (
                                    <div key={i} className="bullet">{a}</div>
                                ))}
                            </div>
                        ))}
                    </section>
                )}

                {data.projects.length > 0 && (
                    <section className="main-section">
                        <h2>Projects</h2>
                        {data.projects.map(proj => (
                            <div key={proj.id} className="item">
                                <div className="item-header">
                                    <span className="item-title">{proj.name}</span>
                                    {proj.link && <span className="item-date">{proj.link.replace(/^https?:\/\//, '')}</span>}
                                </div>
                                {proj.technologies && <div className="item-sub">{proj.technologies}</div>}
                                <div className="bullet">{proj.description}</div>
                                {proj.highlights?.map((h, i) => (
                                    <div key={i} className="bullet">{h}</div>
                                ))}
                            </div>
                        ))}
                    </section>
                )}

                {data.education.length > 0 && (
                    <section className="main-section">
                        <h2>Education</h2>
                        {data.education.map(edu => (
                            <div key={edu.id} className="item">
                                <div className="item-header">
                                    <span className="item-title">{edu.degree}</span>
                                    <span className="item-date">{edu.startYear} – {edu.endYear}</span>
                                </div>
                                <div className="item-sub">{edu.institution}{edu.location && ` • ${edu.location}`}</div>
                                {edu.description && <div className="bullet">{edu.description}</div>}
                            </div>
                        ))}
                    </section>
                )}

                {data.awards?.length > 0 && (
                    <section className="main-section">
                        <h2>Honors & Awards</h2>
                        {data.awards.map(award => (
                            <div key={award.id} className="item">
                                <div className="item-header">
                                    <span className="item-title">{award.title}</span>
                                    <span className="item-date">{award.date}</span>
                                </div>
                                <div className="bullet">{award.description}</div>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </div>
    );
};

export default ResumePreview;
