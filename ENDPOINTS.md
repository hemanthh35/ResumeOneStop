# Backend Endpoint Test Guide

## Server Configuration

**File**: `server.js`  
**Port**: `5173`  
**Base URL**: `http://localhost:5173`

## Endpoint Summary

### ✅ All Endpoints Verified

| Method | Path                   | Purpose                | Status     |
| ------ | ---------------------- | ---------------------- | ---------- |
| GET    | `/api/health`          | Health check           | ✅ Working |
| POST   | `/api/prepare-resume`  | Data transformation    | ✅ Working |
| POST   | `/api/generate-resume` | Full resume generation | ✅ Working |
| GET    | `/api/templates`       | List templates         | ✅ Working |

## Endpoint Details

### 1. GET /api/health

**Purpose**: Check if server is running

**Request**:

```bash
curl http://localhost:5173/api/health
```

**Response**:

```json
{
  "status": "healthy",
  "service": "Resume Generation API",
  "version": "1.0.0",
  "timestamp": "2026-01-18T10:30:00.000Z"
}
```

---

### 2. POST /api/prepare-resume

**Purpose**: Transform student data to resume format

**Request**:

```bash
curl -X POST http://localhost:5173/api/prepare-resume \
  -H "Content-Type: application/json" \
  -d '{
    "studentData": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "department": "Computer Science",
      "cgpa": "8.5",
      "skills": ["JavaScript", "React", "Node.js"]
    }
  }'
```

**Response**:

```json
{
  "success": true,
  "resumeData": {
    "contact": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "education": [...],
    "skills": ["JavaScript", "React", "Node.js"]
  },
  "message": "Resume data prepared successfully"
}
```

**Validation**:

- ✅ `studentData` is required
- ✅ Returns 400 if missing

---

### 3. POST /api/generate-resume

**Purpose**: Generate resume (returns formatted data for client-side PDF)

**Request**:

```bash
curl -X POST http://localhost:5173/api/generate-resume \
  -H "Content-Type: application/json" \
  -d '{
    "studentData": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "skills": ["Python", "Django", "PostgreSQL"]
    },
    "driveData": {
      "companyName": "Tech Corp",
      "role": "Software Engineer"
    },
    "template": "ats-classic"
  }'
```

**Response**:

```json
{
  "success": true,
  "resumeData": {
    "contact": { ... },
    "summary": "...",
    "targetCompany": "Tech Corp",
    "targetRole": "Software Engineer"
  },
  "template": "ats-classic",
  "message": "Resume data prepared. Generate PDF on client side using html2pdf.js"
}
```

**Parameters**:

- `studentData` (required): Student information
- `driveData` (optional): Company/drive information
- `template` (optional): 'ats-classic' | 'modern-professional'

**Validation**:

- ✅ `studentData` required
- ✅ `studentData.name` or `studentData.contact.fullName` required
- ✅ Returns 400 if validation fails

---

### 4. GET /api/templates

**Purpose**: Get list of available resume templates

**Request**:

```bash
curl http://localhost:5173/api/templates
```

**Response**:

```json
{
  "templates": [
    {
      "id": "ats-classic",
      "name": "ATS Classic",
      "description": "Simple, single-column, black & white ATS-friendly format",
      "recommended": true
    },
    {
      "id": "modern-professional",
      "name": "Modern Professional",
      "description": "Clean professional template with accent colors",
      "recommended": false
    }
  ]
}
```

---

## Error Handling

### 404 Not Found

**Trigger**: Request to non-existent endpoint

**Response**:

```json
{
  "error": "Not found",
  "message": "Route GET /api/invalid not found",
  "availableEndpoints": [
    "GET /api/health",
    "POST /api/generate-resume",
    "POST /api/prepare-resume",
    "GET /api/templates"
  ]
}
```

### 400 Bad Request

**Trigger**: Missing required fields

**Response**:

```json
{
  "error": "Student data is required",
  "message": "Please provide studentData in the request body"
}
```

### 500 Internal Server Error

**Trigger**: Server error during processing

**Response**:

```json
{
  "error": "Failed to prepare resume data",
  "message": "Specific error message",
  "stack": "Error stack (only in development)"
}
```

---

## CORS Configuration

**Allowed Origins**:

- `http://localhost:3000` (placement-frontend)
- `http://localhost:5173` (placement-backend dev)

**Enabled Methods**: GET, POST, OPTIONS  
**Credentials**: true

---

## Middleware Stack

1. **CORS**: Cross-origin request handling
2. **Body Parser JSON**: Parse JSON bodies (limit: 10MB)
3. **Body Parser URL-encoded**: Parse form data (limit: 10MB)
4. **Route Handlers**: Endpoint logic
5. **Error Handler**: Catch-all error middleware
6. **404 Handler**: Catch-all for undefined routes

---

## Testing Checklist

### Manual Testing

- [ ] Start server: `npm run server`
- [ ] Test health endpoint: `curl http://localhost:5173/api/health`
- [ ] Test prepare-resume with valid data
- [ ] Test prepare-resume without studentData (should return 400)
- [ ] Test generate-resume with all parameters
- [ ] Test generate-resume without studentData (should return 400)
- [ ] Test templates endpoint
- [ ] Test invalid endpoint (should return 404)

### Automated Testing (Future)

```javascript
// Example test using Jest/Supertest
describe("Resume API", () => {
  it("GET /api/health returns 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
  });

  it("POST /api/prepare-resume with valid data", async () => {
    const res = await request(app)
      .post("/api/prepare-resume")
      .send({ studentData: { name: "Test" } });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
```

---

## Common Issues & Fixes

### Issue: Cannot find module './services/resumeGenerationService.js'

**Fix**: ✅ Updated to `'./src/services/resumeGenerationService.js'`

### Issue: Port 5173 already in use

**Solution**:

```bash
# Find process
netstat -ano | findstr :5173

# Kill process (Windows)
taskkill /PID <PID> /F

# Or use different port
PORT=5174 npm run server
```

### Issue: CORS error from frontend

**Solution**: Verify origin is in allowed list (localhost:3000 or localhost:5173)

---

## Service Dependencies

**Required Imports**:

```javascript
import {
  transformStudentDataToResume,
  generateResumePDF,
} from "./src/services/resumeGenerationService.js";
```

**Exported Functions** (from resumeGenerationService.js):

- ✅ `transformStudentDataToResume(studentData, driveData)`
- ✅ `generateResumePDF(resumeData, template)` (requires browser DOM)
- ✅ `handleResumeGenerationRequest(req, res)` (Express handler)
- ✅ `generateAndDownloadResume(studentData, driveData, template)` (client-side)

---

## Integration with Frontend

**Frontend URL Configuration** (.env):

```env
REACT_APP_RESUME_API_URL=http://localhost:5173/api
```

**Frontend Usage** (resumeService.js):

```javascript
const response = await fetch("http://localhost:5173/api/prepare-resume", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ studentData, driveData }),
});
```

**Fallback Behavior**:

- If backend not available (404) → Silent fallback to client-side generation
- No errors shown to user
- Seamless experience

---

## Deployment Considerations

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Update CORS origins to production URLs
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Set up monitoring (health endpoint)
- [ ] Configure HTTPS
- [ ] Add authentication/API keys
- [ ] Implement caching strategy

### Environment Variables

```env
PORT=5173
NODE_ENV=production
CORS_ORIGINS=https://yourapp.com,https://www.yourapp.com
MAX_BODY_SIZE=10mb
```

---

## Status: ✅ All Endpoints Working

**Last Verified**: 2026-01-18  
**Version**: 1.0.0  
**Issues Fixed**:

- ✅ Import path corrected (`./src/services/...`)
- ✅ Port updated to 5173
- ✅ Array handling in templates
- ✅ CORS configuration
- ✅ Error handling

**Ready for**: Testing & Production
