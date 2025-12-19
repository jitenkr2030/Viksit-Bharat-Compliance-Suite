# Penalty Avoidance & Regulatory Survival System (PARSS) - API Documentation

## 📋 Overview

This document provides comprehensive API documentation for the PARSS integration, including the landing page penalty avoidance demo requests, CRM integration, email automation, and analytics tracking.

## 🔗 Base URLs

- **Landing Page API**: `https://your-domain.com/api`
- **Compliance Suite Backend**: `http://localhost:5000/api`
- **Analytics Dashboard**: `https://your-domain.com/api/demo` (GET)

## 📧 Demo Request API

### POST /api/demo

Submit a comprehensive demo request from the landing page form.

#### Request Headers
```json
{
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0...",
  "X-Forwarded-For": "client-ip"
}
```

#### Request Body
```json
{
  "name": "Dr. Rajesh Kumar",
  "email": "rajesh.kumar@university.edu.in",
  "organization": "Delhi University",
  "phone": "+91 9876543210",
  "institutionType": "university",
  "institutionSize": "large",
  "complianceFocus": "comprehensive",
  "currentChallenges": "Manual compliance tracking across multiple regulatory bodies",
  "expectedOutcomes": "Automated compliance monitoring and reporting",
  "timeline": "short-term",
  "newsletter": true,
  "message": "Looking for a complete solution that integrates with our existing systems"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name of the contact person |
| `email` | string | Yes | Valid email address |
| `organization` | string | Yes | Institution/organization name |
| `phone` | string | Yes | Phone number |
| `institutionType` | string | Yes | Type: `university`, `college`, `deemed`, `autonomous`, `standalone` |
| `institutionSize` | string | No | Size: `small`, `medium`, `large`, `xlarge` |
| `complianceFocus` | string | Yes | Primary focus: `regulatory`, `accreditation`, `automation`, `analytics`, `comprehensive` |
| `currentChallenges` | string | No | Description of current challenges |
| `expectedOutcomes` | string | No | Expected outcomes from platform |
| `timeline` | string | No | Implementation timeline: `immediate`, `short-term`, `medium-term`, `long-term` |
| `newsletter` | boolean | No | Subscribe to newsletter |
| `message` | string | No | Additional requirements or questions |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Demo request submitted successfully! Our compliance experts will contact you within 24 hours.",
  "data": {
    "requestId": "demo_1701234567_abc123def",
    "contact": {
      "name": "Dr. Rajesh Kumar",
      "email": "rajesh.kumar@university.edu.in",
      "organization": "Delhi University",
      "phone": "+91 9876543210"
    },
    "estimatedResponse": "4 hours",
    "nextSteps": [
      "Our compliance expert will contact you within 4 hours",
      "Personalized demo tailored to your institution's needs",
      "Implementation timeline discussion",
      "ROI analysis and pricing discussion",
      "Full platform capabilities walkthrough"
    ],
    "leadScore": 85,
    "priority": "high"
  },
  "analytics": {
    "leadScore": 85,
    "conversionStage": "demo_requested",
    "followUpRequired": true
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "error": "Missing required fields: name, email, organization, phone, institutionType, complianceFocus"
}
```

**422 Unprocessable Entity**
```json
{
  "error": "Invalid email format"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error. Please try again or contact support."
}
```

### GET /api/demo

Retrieve analytics data for the dashboard.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `timeRange` | string | `30d` | Time range: `7d`, `30d`, `90d`, `1y` |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "conversionMetrics": {
      "totalDemoRequests": 156,
      "conversionRate": 23.4,
      "averageLeadScore": 67,
      "highPriorityLeads": 34
    },
    "timeSeriesData": [
      {
        "date": "2024-12-01",
        "requests": 12,
        "conversions": 3
      }
    ],
    "sourceAnalysis": {
      "landing-page": 89,
      "referral": 34,
      "social-media": 21,
      "direct": 12
    },
    "institutionTypes": {
      "university": 45,
      "college": 67,
      "deemed": 23,
      "autonomous": 15,
      "standalone": 6
    }
  }
}
```

## 🔧 Integration Endpoints

### CRM Integration

#### POST /api/crm/sync
Sync demo request data with CRM system (HubSpot, Pipedrive, Salesforce).

```json
{
  "requestId": "demo_1701234567_abc123def",
  "crmSystem": "hubspot",
  "data": {
    "contact": { /* contact information */ },
    "institution": { /* institution details */ },
    "leadScore": 85,
    "priority": "high"
  }
}
```

#### Response
```json
{
  "success": true,
  "crmId": "hubspot_contact_123456",
  "syncStatus": "completed"
}
```

### Email Automation

#### POST /api/email/trigger
Trigger automated email sequences.

```json
{
  "triggerType": "demo_confirmation",
  "recipient": {
    "email": "rajesh.kumar@university.edu.in",
    "name": "Dr. Rajesh Kumar"
  },
  "templateData": {
    "organization": "Delhi University",
    "estimatedResponse": "4 hours",
    "priority": "high"
  }
}
```

### Analytics Tracking

#### POST /api/analytics/events
Track custom analytics events.

```json
{
  "event": "demo_request_submitted",
  "data": {
    "requestId": "demo_1701234567_abc123def",
    "leadScore": 85,
    "priority": "high",
    "institutionType": "university"
  },
  "timestamp": "2024-12-18T22:14:03Z",
  "page": "/",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1"
}
```

## 📊 Lead Scoring Algorithm

### Scoring Components

| Component | Weight | Description |
|-----------|--------|-------------|
| Institution Type | 25% | University (25), Deemed (25), College (15), Autonomous (15), Standalone (10) |
| Institution Size | 20% | XL (20), Large (15), Medium (10), Small (5) |
| Compliance Focus | 25% | Comprehensive (25), Regulatory (20), Accreditation (20), Automation (15), Analytics (10) |
| Timeline Urgency | 15% | Immediate (15), Short-term (10), Medium-term (5), Long-term (0) |
| Contact Quality | 15% | Complete information (10), Valid email (3), Phone number (2) |

### Priority Levels
- **High Priority**: Score ≥ 70
- **Medium Priority**: Score 40-69
- **Low Priority**: Score < 40

## 🏗️ Integration Architecture

### Data Flow
```
Landing Page Form
    ↓
Form Validation
    ↓
Demo API (/api/demo)
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   CRM Sync      │ Email Automation│ Analytics Track │
└─────────────────┴─────────────────┴─────────────────┘
    ↓                    ↓                    ↓
HubSpot/Pipedrive   SendGrid/Mailgun   Google Analytics
    ↓                    ↓                    ↓
Sales Team Alert   Confirmation Email  Dashboard Data
```

### Webhook Endpoints

#### CRM Webhook
```typescript
POST /api/webhooks/crm
{
  "event": "contact_created",
  "data": {
    "crmId": "hubspot_contact_123456",
    "contactId": "demo_1701234567_abc123def",
    "properties": {
      "lead_score": 85,
      "demo_request_date": "2024-12-18T22:14:03Z"
    }
  }
}
```

#### Email Webhook
```typescript
POST /api/webhooks/email
{
  "event": "email_delivered",
  "data": {
    "messageId": "sendgrid_msg_123456",
    "recipient": "rajesh.kumar@university.edu.in",
    "template": "demo_confirmation"
  }
}
```

## 🔒 Authentication & Security

### API Key Authentication
For internal API endpoints:
```json
{
  "headers": {
    "Authorization": "Bearer your-api-key-here",
    "X-API-Version": "2024-12-18"
  }
}
```

### Rate Limiting
- **Demo Requests**: 10 requests per minute per IP
- **Analytics**: 100 requests per minute per API key
- **CRM Sync**: 50 requests per minute per API key

### CORS Configuration
```javascript
const corsOptions = {
  origin: [
    'https://your-domain.com',
    'https://admin.your-domain.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

## 📝 Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Bad Request | Check required fields and data format |
| 401 | Unauthorized | Include valid API key |
| 403 | Forbidden | Check API permissions |
| 422 | Unprocessable Entity | Validate email format and field constraints |
| 429 | Rate Limited | Wait before retrying request |
| 500 | Internal Server Error | Contact support if persistent |
| 503 | Service Unavailable | CRM/email service temporarily down |

## 🧪 Testing

### Test Data
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "organization": "Test University",
  "phone": "+91 1234567890",
  "institutionType": "university",
  "complianceFocus": "comprehensive"
}
```

### Postman Collection
Import the provided Postman collection for comprehensive API testing.

### curl Examples

#### Submit Demo Request
```bash
curl -X POST https://your-domain.com/api/demo \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "organization": "Test University",
    "phone": "+91 1234567890",
    "institutionType": "university",
    "complianceFocus": "comprehensive"
  }'
```

#### Get Analytics Data
```bash
curl -X GET "https://your-domain.com/api/demo?timeRange=30d" \
  -H "Authorization: Bearer your-api-key"
```

## 📚 Additional Resources

- [Landing Page Integration Guide](./integration-guide.md)
- [CRM Setup Instructions](./crm-setup.md)
- [Email Automation Guide](./email-automation.md)
- [Analytics Dashboard Guide](./analytics-dashboard.md)
- [Troubleshooting Guide](./troubleshooting.md)

## 📞 Support

For API support and questions:
- **Email**: api-support@viksitbharat.com
- **Documentation**: https://docs.viksitbharat.com/api
- **Status Page**: https://status.viksitbharat.com

---

**Last Updated**: December 18, 2024  
**API Version**: 2024.12.18  
**Maintainer**: Viksit Bharat Development Team