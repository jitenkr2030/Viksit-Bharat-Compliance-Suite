import { NextRequest, NextResponse } from 'next/server';

// Enhanced demo request API with CRM integration, email automation, and analytics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Enhanced form fields from the comprehensive landing page form
    const {
      name,
      email,
      organization,
      phone,
      institutionType,
      institutionSize,
      complianceFocus,
      currentChallenges,
      expectedOutcomes,
      timeline,
      newsletter,
      message
    } = body;
    
    // Enhanced validation
    if (!name || !email || !organization || !phone || !institutionType || !complianceFocus) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, organization, phone, institutionType, complianceFocus' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Create comprehensive demo request data
    const demoRequestData = {
      id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contact: {
        name,
        email,
        organization,
        phone
      },
      institution: {
        type: institutionType,
        size: institutionSize || 'medium',
        complianceFocus,
        currentChallenges: currentChallenges || '',
        expectedOutcomes: expectedOutcomes || '',
        timeline: timeline || 'medium-term'
      },
      additionalInfo: {
        message: message || '',
        newsletter: newsletter || false,
        source: 'landing-page',
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
        referrer: request.headers.get('referer'),
        ip: request.ip
      },
      status: 'new',
      priority: calculatePriority(institutionType, complianceFocus, timeline),
      leadScore: calculateLeadScore(institutionType, institutionSize, complianceFocus)
    };
    
    // Log the comprehensive demo request
    console.log('Enhanced demo request received:', demoRequestData);
    
    // 1. CRM Integration - Simulate HubSpot/Pipedrive integration
    const crmIntegration = await integrateWithCRM(demoRequestData);
    
    // 2. Email Automation - Send confirmation and follow-up emails
    const emailAutomation = await triggerEmailAutomation(demoRequestData);
    
    // 3. Analytics Tracking - Track conversion funnel
    await trackAnalyticsEvent('demo_request_submitted', demoRequestData);
    
    // 4. Lead Scoring - Calculate and store lead score
    const leadScoreData = await storeLeadScore(demoRequestData);
    
    // 5. Sales Team Notification - Alert sales team for high-priority leads
    if (demoRequestData.priority === 'high') {
      await notifySalesTeam(demoRequestData);
    }
    
    // 6. Database Storage - Store in landing page backend
    await storeDemoRequest(demoRequestData);
    
    // 7. API call to PARSS backend
    const backendIntegration = await integrateWithComplianceSuite(demoRequestData);
    
    // Enhanced success response
    return NextResponse.json({
      success: true,
      message: 'Demo request submitted successfully! Our compliance experts will contact you within 24 hours.',
      data: {
        requestId: demoRequestData.id,
        contact: demoRequestData.contact,
        estimatedResponse: demoRequestData.priority === 'high' ? '4 hours' : '24 hours',
        nextSteps: getNextSteps(demoRequestData),
        leadScore: demoRequestData.leadScore,
        priority: demoRequestData.priority
      },
      analytics: {
        leadScore: demoRequestData.leadScore,
        conversionStage: 'demo_requested',
        followUpRequired: true
      }
    });
    
  } catch (error) {
    console.error('Error processing demo request:', error);
    
    // Track error analytics
    await trackAnalyticsEvent('demo_request_error', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again or contact support.' },
      { status: 500 }
    );
  }
}

// Helper functions for enhanced functionality

function calculatePriority(institutionType: string, complianceFocus: string, timeline: string): string {
  let score = 0;
  
  // Institution type scoring
  const typeScores: { [key: string]: number } = {
    'university': 3,
    'deemed': 3,
    'college': 2,
    'autonomous': 2,
    'standalone': 1
  };
  score += typeScores[institutionType] || 1;
  
  // Compliance focus scoring
  const focusScores: { [key: string]: number } = {
    'comprehensive': 3,
    'regulatory': 2,
    'accreditation': 2,
    'automation': 2,
    'analytics': 1
  };
  score += focusScores[complianceFocus] || 1;
  
  // Timeline scoring
  const timelineScores: { [key: string]: number } = {
    'immediate': 3,
    'short-term': 2,
    'medium-term': 1,
    'long-term': 0
  };
  score += timelineScores[timeline] || 0;
  
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

function calculateLeadScore(institutionType: string, institutionSize: string, complianceFocus: string): number {
  let score = 0;
  
  // Institution type contribution
  const typeWeights: { [key: string]: number } = {
    'university': 25,
    'deemed': 25,
    'college': 15,
    'autonomous': 15,
    'standalone': 10
  };
  score += typeWeights[institutionType] || 5;
  
  // Institution size contribution
  const sizeWeights: { [key: string]: number } = {
    'xlarge': 20,
    'large': 15,
    'medium': 10,
    'small': 5
  };
  score += sizeWeights[institutionSize] || 8;
  
  // Compliance focus contribution
  const focusWeights: { [key: string]: number } = {
    'comprehensive': 25,
    'regulatory': 20,
    'accreditation': 20,
    'automation': 15,
    'analytics': 10
  };
  score += focusWeights[complianceFocus] || 5;
  
  return Math.min(score, 100); // Cap at 100
}

async function integrateWithCRM(data: any) {
  // Simulate CRM integration (HubSpot, Pipedrive, Salesforce)
  console.log('Integrating with CRM:', data.contact.email);
  
  // In real implementation:
  // const hubspotResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
  //   method: 'POST',
  //   headers: { 'Authorization': 'Bearer ' + process.env.HUBSPOT_TOKEN },
  //   body: JSON.stringify({
  //     properties: {
  //       email: data.contact.email,
  //       firstname: data.contact.name.split(' ')[0],
  //       lastname: data.contact.name.split(' ').slice(1).join(' '),
  //       company: data.contact.organization,
  //       phone: data.contact.phone,
  //       lead_score: data.leadScore,
  //       priority: data.priority,
  //       demo_request_date: data.additionalInfo.timestamp
  //     }
  //   })
  // });
  
  return { success: true, crmId: `crm_${Date.now()}` };
}

async function triggerEmailAutomation(data: any) {
  // Simulate email automation (SendGrid, Mailgun, AWS SES)
  console.log('Triggering email automation for:', data.contact.email);
  
  // Email sequence:
  // 1. Immediate confirmation email
  // 2. Follow-up email in 1 hour (if high priority)
  // 3. Demo scheduling email in 24 hours
  // 4. Educational content email in 3 days
  
  // In real implementation:
  // await sendEmail({
  //   to: data.contact.email,
  //   template: 'demo_confirmation',
  //   data: {
  //     name: data.contact.name,
  //     organization: data.contact.organization,
  //     estimatedResponse: data.priority === 'high' ? '4 hours' : '24 hours'
  //   }
  // });
  
  return { success: true, emailsScheduled: 4 };
}

async function trackAnalyticsEvent(event: string, data: any) {
  // Enhanced analytics tracking
  console.log('Analytics event:', event, data);
  
  // In real implementation:
  // - Google Analytics 4
  // - Mixpanel
  // - Custom analytics dashboard
  // - Conversion funnel tracking
  
  return { success: true };
}

async function storeLeadScore(data: any) {
  // Store lead score for analytics and sales prioritization
  console.log('Storing lead score:', data.leadScore);
  
  return { success: true, leadScore: data.leadScore };
}

async function notifySalesTeam(data: any) {
  // Notify sales team for high-priority leads
  if (data.priority === 'high') {
    console.log('High-priority lead alert:', data.contact.email);
    
    // Send Slack notification, email, or integrate with CRM
    // await sendSlackNotification(`High-priority demo request: ${data.contact.organization}`);
  }
  
  return { success: true };
}

async function storeDemoRequest(data: any) {
  // Store in the landing page backend database
  console.log('Storing demo request in database:', data.id);
  
  // In real implementation:
  // await fetch('http://localhost:5000/api/landing-page/demo-requests', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data)
  // });
  
  return { success: true };
}

async function integrateWithComplianceSuite(data: any) {
  // Create user record in the compliance suite system
  console.log('Creating user record in compliance suite:', data.contact.email);
  
  // In real implementation:
  // await fetch('http://localhost:3001/api/users/pre-register', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     email: data.contact.email,
  //     name: data.contact.name,
  //     organization: data.contact.organization,
  //     preRegistrationData: data.institution
  //   })
  // });
  
  return { success: true };
}

function getNextSteps(data: any): string[] {
  const steps = [
    'Our compliance expert will contact you within ' + (data.priority === 'high' ? '4 hours' : '24 hours'),
    'Personalized demo tailored to your institution\'s needs',
    'Implementation timeline discussion',
    'ROI analysis and pricing discussion'
  ];
  
  if (data.institution.complianceFocus === 'comprehensive') {
    steps.push('Full platform capabilities walkthrough');
  }
  
  if (data.institution.timeline === 'immediate') {
    steps.push('Priority onboarding process');
  }
  
  return steps;
}

// GET endpoint for analytics dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    
    // Analytics data for dashboard
    const analyticsData = await getAnalyticsData(timeRange);
    
    return NextResponse.json({
      success: true,
      data: analyticsData
    });
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

async function getAnalyticsData(timeRange: string) {
  // Mock analytics data - in real implementation, query database
  return {
    conversionMetrics: {
      totalDemoRequests: 156,
      conversionRate: 23.4,
      averageLeadScore: 67,
      highPriorityLeads: 34
    },
    timeSeriesData: [
      { date: '2024-12-01', requests: 12, conversions: 3 },
      { date: '2024-12-02', requests: 15, conversions: 4 },
      { date: '2024-12-03', requests: 18, conversions: 5 }
    ],
    sourceAnalysis: {
      'landing-page': 89,
      'referral': 34,
      'social-media': 21,
      'direct': 12
    },
    institutionTypes: {
      'university': 45,
      'college': 67,
      'deemed': 23,
      'autonomous': 15,
      'standalone': 6
    }
  };
}