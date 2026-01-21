/**
 * Resume Generation Service
 * 
 * This service provides server-side resume generation capabilities
 * for the placement-frontend application. It uses html2pdf.js to
 * convert resume HTML templates into professional PDF documents.
 * 
 * Integration Flow:
 * Frontend (placement-frontend) → POST /api/generate-resume → This Service → PDF Response
 * 
 * Note: html2pdf.js requires browser DOM, so PDF generation only works client-side
 */

// Note: html2pdf is only imported in browser environment, not in Node.js
// For Node.js server, we only provide data transformation

/**
 * Template renderer functions
 */

const ATSClassicTemplate = (data) => {
  return `
    <div class="ats-resume" style="font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; padding: 0.5in; max-width: 8.5in; margin: 0 auto; color: #000;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 16px;">
        <div style="font-size: 18pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">${data.contact?.fullName || 'Your Name'}</div>
        <div style="font-size: 10pt; margin-top: 4px;">
          ${data.contact?.email || 'email@example.com'} | 
          ${data.contact?.phone || '+1 (555) 000-0000'} | 
          ${data.contact?.location || 'City, State'}
        </div>
        ${data.contact?.linkedin ? `<div style="font-size: 10pt;">LinkedIn: ${data.contact.linkedin}</div>` : ''}
      </div>

      <!-- Summary -->
      ${data.summary ? `
        <div style="margin-bottom: 16px;">
          <div style="font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 6px;">Professional Summary</div>
          <div style="text-align: justify;">${data.summary}</div>
        </div>
      ` : ''}

      <!-- Education -->
      ${Array.isArray(data.education) && data.education.length > 0 ? `
        <div style="margin-bottom: 16px;">
          <div style="font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 6px;">Education</div>
          ${data.education.map(edu => `
            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between;">
                <strong>${edu.degree} in ${edu.field}</strong>
                <span>${edu.startYear} - ${edu.endYear}</span>
              </div>
              <div>${edu.institution}, ${edu.location}</div>
              ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Experience -->
      ${Array.isArray(data.experience) && data.experience.length > 0 ? `
        <div style="margin-bottom: 16px;">
          <div style="font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 6px;">Experience</div>
          ${data.experience.map(exp => `
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between;">
                <strong>${exp.title}</strong>
                <span>${exp.startDate} - ${exp.endDate || 'Present'}</span>
              </div>
              <div style="font-style: italic;">${exp.company}, ${exp.location}</div>
              ${exp.responsibilities?.length ? `
                <ul style="margin: 4px 0; padding-left: 20px;">
                  ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Projects -->
      ${Array.isArray(data.projects) && data.projects.length > 0 ? `
        <div style="margin-bottom: 16px;">
          <div style="font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 6px;">Projects</div>
          ${data.projects.map(proj => `
            <div style="margin-bottom: 12px;">
              <div><strong>${proj.name}</strong> ${proj.technologies ? `(${proj.technologies})` : ''}</div>
              ${proj.description ? `<div>${proj.description}</div>` : ''}
              ${proj.highlights?.length ? `
                <ul style="margin: 4px 0; padding-left: 20px;">
                  ${proj.highlights.map(h => `<li>${h}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Skills -->
      ${Array.isArray(data.skills) && data.skills.length > 0 ? `
        <div style="margin-bottom: 16px;">
          <div style="font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 6px;">Technical Skills</div>
          <div>${data.skills.join(', ')}</div>
        </div>
      ` : ''}

      <!-- Certifications -->
      ${Array.isArray(data.certifications) && data.certifications.length > 0 ? `
        <div style="margin-bottom: 16px;">
          <div style="font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 6px;">Certifications</div>
          ${data.certifications.map(cert => `
            <div>• ${cert.name} - ${cert.issuer} (${cert.year})</div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
};

const ModernProfessionalTemplate = (data) => {
  return `
    <div style="font-family: 'Georgia', serif; font-size: 10.5pt; line-height: 1.5; padding: 0.5in; max-width: 8.5in; margin: 0 auto; color: #1a1a1a;">
      <!-- Header with accent color -->
      <div style="border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
        <div style="font-size: 22pt; font-weight: 600; color: #1e293b;">${data.contact?.fullName || 'Your Name'}</div>
        <div style="font-size: 9.5pt; color: #64748b; margin-top: 6px;">
          ${data.contact?.email || ''} • ${data.contact?.phone || ''} • ${data.contact?.location || ''}
        </div>
        ${data.contact?.linkedin || data.contact?.website ? `
          <div style="font-size: 9.5pt; color: #3b82f6; margin-top: 4px;">
            ${data.contact?.linkedin ? data.contact.linkedin : ''} ${data.contact?.website ? '• ' + data.contact.website : ''}
          </div>
        ` : ''}
      </div>

      <!-- Professional Summary -->
      ${data.summary ? `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 12pt; font-weight: 600; color: #2563eb; margin-bottom: 8px;">PROFESSIONAL SUMMARY</div>
          <div style="text-align: justify; line-height: 1.6;">${data.summary}</div>
        </div>
      ` : ''}

      <!-- Education -->
      ${Array.isArray(data.education) && data.education.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 12pt; font-weight: 600; color: #2563eb; margin-bottom: 8px;">EDUCATION</div>
          ${data.education.map(edu => `
            <div style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; font-weight: 500;">
                <span>${edu.degree} in ${edu.field}</span>
                <span style="color: #64748b;">${edu.startYear} - ${edu.endYear}</span>
              </div>
              <div style="color: #475569; font-style: italic;">${edu.institution}, ${edu.location}</div>
              ${edu.gpa ? `<div style="color: #64748b; font-size: 9.5pt;">GPA: ${edu.gpa}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Experience -->
      ${Array.isArray(data.experience) && data.experience.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 12pt; font-weight: 600; color: #2563eb; margin-bottom: 8px;">EXPERIENCE</div>
          ${data.experience.map(exp => `
            <div style="margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; font-weight: 500;">
                <span>${exp.title}</span>
                <span style="color: #64748b;">${exp.startDate} - ${exp.endDate || 'Present'}</span>
              </div>
              <div style="color: #475569; font-style: italic; margin-bottom: 4px;">${exp.company}, ${exp.location}</div>
              ${exp.responsibilities?.length ? `
                <ul style="margin: 6px 0; padding-left: 20px; line-height: 1.6;">
                  ${exp.responsibilities.map(resp => `<li style="margin-bottom: 4px;">${resp}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Projects -->
      ${Array.isArray(data.projects) && data.projects.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 12pt; font-weight: 600; color: #2563eb; margin-bottom: 8px;">PROJECTS</div>
          ${data.projects.map(proj => `
            <div style="margin-bottom: 12px;">
              <div style="font-weight: 500;">${proj.name} ${proj.technologies ? `<span style="color: #64748b; font-weight: 400;">(${proj.technologies})</span>` : ''}</div>
              ${proj.description ? `<div style="margin: 4px 0;">${proj.description}</div>` : ''}
              ${proj.highlights?.length ? `
                <ul style="margin: 6px 0; padding-left: 20px;">
                  ${proj.highlights.map(h => `<li style="margin-bottom: 3px;">${h}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Skills -->
      ${Array.isArray(data.skills) && data.skills.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 12pt; font-weight: 600; color: #2563eb; margin-bottom: 8px;">TECHNICAL SKILLS</div>
          <div style="line-height: 1.8;">${data.skills.join(' • ')}</div>
        </div>
      ` : ''}

      <!-- Certifications -->
      ${Array.isArray(data.certifications) && data.certifications.length > 0 ? `
        <div>
          <div style="font-size: 12pt; font-weight: 600; color: #2563eb; margin-bottom: 8px;">CERTIFICATIONS</div>
          ${data.certifications.map(cert => `
            <div style="margin-bottom: 4px;">• ${cert.name} - ${cert.issuer} (${cert.year})</div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
};

/**
 * Generate a resume PDF from student data
 * 
 * @param {Object} resumeData - Student resume data
 * @param {string} template - Template ID ('ats-classic', 'modern-professional', 'minimal', 'creative')
 * @returns {Promise<Blob>} - PDF blob
 * 
 * Note: This function requires browser environment (html2pdf.js needs DOM)
 * For Node.js server, use transformStudentDataToResume() only
 */
export async function generateResumePDF(resumeData, template = 'ats-classic') {
  // This function is for browser environment only
  // On server, we just return the data for client-side PDF generation
  if (typeof window === 'undefined') {
    throw new Error('generateResumePDF requires browser environment. Use client-side generation instead.');
  }
  
  try {
    // Dynamically import html2pdf in browser
    const html2pdf = (await import('html2pdf.js')).default;
    // Select template renderer
    let htmlContent;
    switch (template) {
      case 'modern-professional':
        htmlContent = ModernProfessionalTemplate(resumeData);
        break;
      case 'ats-classic':
      default:
        htmlContent = ATSClassicTemplate(resumeData);
        break;
    }

    // Create temporary div for html2pdf
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    document.body.appendChild(element);

    // Configure html2pdf options
    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `${resumeData.contact?.fullName?.replace(/\s+/g, '_') || 'Resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait' 
      }
    };

    // Generate PDF
    const pdfBlob = await html2pdf()
      .set(options)
      .from(element)
      .outputPdf('blob');

    // Cleanup
    document.body.removeChild(element);

    return pdfBlob;
  } catch (error) {
    console.error('Resume generation error:', error);
    throw new Error('Failed to generate resume PDF: ' + error.message);
  }
}

/**
 * Transform placement-frontend student data into resume format
 * 
 * @param {Object} studentData - Student data from Firebase
 * @param {Object} driveData - Selected drive/company data
 * @returns {Object} - Resume data formatted for templates
 */
export function transformStudentDataToResume(studentData, driveData = null) {
  // Helper to ensure arrays
  const ensureArray = (data) => Array.isArray(data) ? data : [];
  
  return {
    contact: {
      fullName: studentData.name || '',
      email: studentData.email || '',
      phone: studentData.phone || '',
      location: studentData.location || '',
      linkedin: studentData.linkedin || '',
      github: studentData.github || '',
      website: studentData.portfolio || ''
    },
    summary: studentData.summary || studentData.about || 
      `${studentData.department || 'Computer Science'} student with ${studentData.cgpa || 'strong'} academic record, ` +
      `seeking opportunities in ${driveData?.role || 'software development'}.`,
    education: Array.isArray(studentData.education) && studentData.education.length > 0 ? studentData.education : [
      {
        degree: studentData.degree || 'Bachelor of Technology',
        field: studentData.department || 'Computer Science',
        institution: studentData.college || 'University',
        location: studentData.location || '',
        startYear: studentData.startYear || '2020',
        endYear: studentData.graduationYear || '2024',
        gpa: studentData.cgpa ? `${studentData.cgpa}/10.0` : ''
      }
    ],
    experience: ensureArray(studentData.experience),
    projects: ensureArray(studentData.projects),
    skills: Array.isArray(studentData.skills) ? studentData.skills : 
      (studentData.skills ? studentData.skills.split(',').map(s => s.trim()) : []),
    certifications: ensureArray(studentData.certifications),
    
    // Drive-specific customization
    ...(driveData && {
      targetCompany: driveData.companyName,
      targetRole: driveData.role,
      requiredSkills: driveData.requiredSkills
    })
  };
}

/**
 * Express.js/API handler for resume generation
 * Use this in a backend API route
 */
export async function handleResumeGenerationRequest(req, res) {
  try {
    const { studentData, driveData, template } = req.body;

    if (!studentData) {
      return res.status(400).json({ 
        error: 'Student data is required' 
      });
    }

    // Transform data
    const resumeData = transformStudentDataToResume(studentData, driveData);

    // Generate PDF
    const pdfBlob = await generateResumePDF(resumeData, template);

    // Send as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resumeData.contact.fullName}_Resume.pdf"`);
    res.send(Buffer.from(await pdfBlob.arrayBuffer()));

  } catch (error) {
    console.error('Resume generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate resume',
      details: error.message 
    });
  }
}

/**
 * Client-side resume generation (for placement-frontend)
 * Call this from React components
 */
export async function generateAndDownloadResume(studentData, driveData = null, template = 'ats-classic') {
  try {
    const resumeData = transformStudentDataToResume(studentData, driveData);
    const pdfBlob = await generateResumePDF(resumeData, template);

    // Trigger download
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.contact.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, filename: a.download };
  } catch (error) {
    console.error('Resume download error:', error);
    throw error;
  }
}
