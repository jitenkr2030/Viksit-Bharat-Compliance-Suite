// AI Assistant Interface Component

import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Brain,
  MessageCircle,
  Send,
  Paperclip,
  Star,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  Bot,
  Settings,
  Download,
  BarChart3,
  Lightbulb,
  Zap,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit,
} from 'lucide-react';
import { useAIAssistants, useAIChat, useAIAnalytics } from '@/hooks/usePhase3';
import { AIAssistant, AIChatMessage } from '@/types/phase3';

interface AIAssistantInterfaceProps {
  key?: number; // Used for forcing re-render
}

const AIAssistantInterface: React.FC<AIAssistantInterfaceProps> = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [chatInput, setChatInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    assistants,
    loading: assistantsLoading,
    createAssistant,
    updateAssistant,
  } = useAIAssistants({
    page: 1,
    limit: 10,
    isActive: true,
  });

  const {
    session,
    messages,
    loading: chatLoading,
    error: chatError,
    createSession,
    sendMessage,
    loadHistory,
    endConversation,
    provideFeedback,
  } = useAIChat(selectedAssistant);

  const {
    analytics,
    loading: analyticsLoading,
  } = useAIAnalytics('7d');

  useEffect(() => {
    if (assistants.length > 0 && !selectedAssistant) {
      setSelectedAssistant(assistants[0].id);
    }
  }, [assistants, selectedAssistant]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedAssistant) return;

    try {
      if (!session) {
        await createSession({
          institution: 'Viksit Bharat University',
          userRole: 'Administrator',
          currentPage: 'ai-assistant',
        });
      }

      await sendMessage(chatInput, attachments);
      setChatInput('');
      setAttachments([]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleFeedback = async (messageId: string, feedback: any) => {
    try {
      await provideFeedback(messageId, feedback);
    } catch (error) {
      console.error('Failed to provide feedback:', error);
    }
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br />');
  };

  if (assistantsLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading AI assistant...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Brain className="h-6 w-6 mr-2" />
            AI Compliance Assistant
          </h2>
          <p className="text-gray-600 mt-1">
            Intelligent compliance guidance and document analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Assistant" />
            </SelectTrigger>
            <SelectContent>
              {assistants.map((assistant) => (
                <SelectItem key={assistant.id} value={assistant.id}>
                  {assistant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{analytics.usage.totalInteractions}</div>
              <p className="text-sm text-muted-foreground">Total Interactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{analytics.usage.activeUsers}</div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{analytics.performance.averageResponseTime}ms</div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{analytics.performance.userSatisfaction.toFixed(1)}/5</div>
              <p className="text-sm text-muted-foreground">User Satisfaction</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {assistants.find(a => a.id === selectedAssistant)?.name || 'Select an Assistant'}
                  </CardTitle>
                  <CardDescription>
                    {assistants.find(a => a.id === selectedAssistant)?.capabilities?.[0]?.description || 'AI-powered compliance assistant'}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {messages.length} messages
                  </Badge>
                  {session && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => endConversation()}
                    >
                      End Session
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!session && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Welcome to AI Compliance Assistant
                      </h3>
                      <p className="text-gray-600 mb-4">
                        I'm here to help you with compliance questions, document analysis, and regulatory guidance.
                      </p>
                      <Button onClick={() => createSession()}>
                        Start Conversation
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {message.role === 'assistant' && (
                              <Bot className="h-5 w-5 mt-0.5 text-blue-600" />
                            )}
                            {message.role === 'user' && (
                              <User className="h-5 w-5 mt-0.5 text-white" />
                            )}
                            <div className="flex-1">
                              <div
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                              />
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.attachments.map((attachment, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center space-x-2 text-xs opacity-75"
                                    >
                                      <Paperclip className="h-3 w-3" />
                                      <span>{attachment.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {message.feedback && (
                                <div className="mt-2 flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    Confidence: {Math.round(message.confidence * 100)}%
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                            {message.role === 'assistant' && !message.feedback && (
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleFeedback(message.id, { helpful: true, accurate: true, complete: true })}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleFeedback(message.id, { helpful: false, accurate: false, complete: false })}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t p-4">
                {attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <Paperclip className="h-3 w-3" />
                        <span className="text-xs">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removeAttachment(index)}
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Ask about compliance, regulations, or upload documents..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={!selectedAssistant || chatLoading}
                    />
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="absolute right-2 top-2 cursor-pointer"
                    >
                      <Paperclip className="h-4 w-4 text-gray-400" />
                    </label>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || !selectedAssistant || chatLoading}
                  >
                    {chatLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>
                View and manage your conversation history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sample conversation items */}
                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Brain className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Compliance Document Review</h3>
                        <p className="text-sm text-gray-600">
                          Discussed NAAC accreditation requirements and document preparation
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Today, 2:30 PM</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">12 messages</Badge>
                        <Badge variant="outline">25 min</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Brain className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Regulatory Framework Analysis</h3>
                        <p className="text-sm text-gray-600">
                          Analyzed UGC guidelines for autonomous colleges
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Yesterday</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">8 messages</Badge>
                        <Badge variant="outline">18 min</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>
                AI assistant's knowledge sources and coverage areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Knowledge Sources</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">UGC Guidelines</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">NAAC Frameworks</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">AICTE Regulations</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">NBA Standards</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-3">Coverage Areas</h3>
                  <div className="space-y-2">
                    <div className="p-2 border rounded">
                      <div className="font-medium text-sm">Regulatory Compliance</div>
                      <div className="text-xs text-gray-600">Complete coverage</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium text-sm">Accreditation Processes</div>
                      <div className="text-xs text-gray-600">95% coverage</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium text-sm">Quality Assurance</div>
                      <div className="text-xs text-gray-600">90% coverage</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-medium text-sm">Document Preparation</div>
                      <div className="text-xs text-gray-600">85% coverage</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  AI assistant performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Accuracy</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Task Completion</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Satisfaction</span>
                    <span className="font-medium">4.3/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '86%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>
                  Assistant usage patterns and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Most Active Hours</span>
                    <span className="font-medium">9 AM - 5 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Session Length</span>
                    <span className="font-medium">18 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Popular Topics</span>
                    <span className="font-medium">Compliance, Accreditation</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Escalation Rate</span>
                    <span className="font-medium">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Assistant Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New AI Assistant</DialogTitle>
            <DialogDescription>
              Configure a new AI assistant for specific compliance domains
            </DialogDescription>
          </DialogHeader>
          <CreateAssistantForm onSubmit={createAssistant} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Create Assistant Form Component
const CreateAssistantForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'compliance_guide',
    description: '',
    tone: 'professional',
    domainExpertise: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      capabilities: [
        {
          name: 'Compliance Guidance',
          description: 'Provide guidance on regulatory compliance',
          category: 'compliance',
          confidence: 0.9,
          accuracy: 0.9,
          supportedLanguages: ['en'],
          requiresContext: true,
          examples: ['How to prepare for NAAC accreditation?'],
        },
      ],
      configuration: {
        modelVersion: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        responseTimeout: 30,
        contextWindow: 4000,
        personalization: {
          preferredTone: formData.tone,
          explanationLevel: 'detailed',
          languagePreference: 'en',
          domainExpertise: formData.domainExpertise.split(',').map(d => d.trim()),
          userRole: 'compliance_officer',
          institutionContext: 'higher_education',
        },
        safety: {
          contentFiltering: true,
          biasDetection: true,
          toxicityChecking: true,
          factChecking: true,
          allowedDomains: ['education', 'compliance', 'accreditation'],
          blockedTopics: [],
          escalationRules: [],
        },
        integrations: {
          databaseConnections: ['compliance_db'],
          apiEndpoints: ['ugc_api', 'naac_api'],
          webhookUrls: [],
          notificationChannels: ['email'],
          externalServices: [],
        },
      },
      knowledgeBase: {
        id: 'default',
        name: 'Default Knowledge Base',
        sources: [],
        lastUpdated: new Date(),
        version: '1.0',
        size: 0,
        coverage: {
          regulatoryFrameworks: [],
          complianceAreas: [],
          industrySectors: [],
          geographicRegions: [],
          updateFrequency: 'weekly',
          completeness: 0,
        },
        accuracy: 0,
        freshness: 0,
      },
      trainingData: {
        id: 'default',
        dataset: 'compliance_training',
        size: 0,
        lastTrained: new Date(),
        performance: {
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1Score: 0,
          responseTime: 0,
          throughput: 0,
        },
        validation: {
          crossValidationScore: 0,
          testAccuracy: 0,
          overfittingScore: 0,
          generalizationError: 0,
        },
        quality: {
          completeness: 0,
          consistency: 0,
          accuracy: 0,
          timeliness: 0,
          validity: 0,
        },
        sources: [],
        bias: {
          demographicBias: 0,
          geographicBias: 0,
          temporalBias: 0,
          representationBias: 0,
        },
      },
      performance: {
        overall: {
          averageResponseTime: 0,
          successRate: 0,
          userSatisfaction: 0,
          taskCompletionRate: 0,
          errorRate: 0,
          uptime: 100,
          lastMonth: Date.now(),
        },
        byCapability: [],
        trends: [],
        bottlenecks: [],
        recommendations: [],
      },
      usage: {
        totalRequests: 0,
        requestsByType: {},
        activeUsers: 0,
        peakUsage: {
          timestamp: new Date(),
          requestsPerMinute: 0,
          concurrentUsers: 0,
          responseTime: 0,
          errorRate: 0,
        },
        patterns: [],
        costs: {
          totalCost: 0,
          costByRequest: 0,
          costByCapability: {},
          monthlyTrend: [],
          optimization: [],
        },
        efficiency: {
          averageResponseTime: 0,
          taskCompletionRate: 0,
          userSatisfaction: 0,
          resourceUtilization: 0,
          bottlenecks: [],
          improvements: [],
        },
      },
      integration: {
        platforms: [],
        apis: [],
        webhooks: [],
        databases: [],
        services: [],
        security: {
          encryption: {
            algorithm: 'AES-256',
            keyRotation: 90,
            inTransit: true,
            atRest: true,
            certificates: [],
          },
          authentication: {
            method: 'oauth2',
            configuration: {},
            sessionTimeout: 60,
            maxSessions: 10,
          },
          authorization: {
            model: 'rbac',
            roles: [],
            permissions: [],
            policies: [],
          },
          audit: {
            enabled: true,
            level: 'detailed',
            retention: 90,
            alerts: [],
            reports: [],
          },
        },
        monitoring: {
          metrics: [],
          dashboards: [],
          alerts: [],
          logs: [],
        },
      },
      isActive: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Assistant Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Compliance Expert"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compliance_guide">Compliance Guide</SelectItem>
            <SelectItem value="document_analyzer">Document Analyzer</SelectItem>
            <SelectItem value="risk_assessor">Risk Assessor</SelectItem>
            <SelectItem value="regulatory_expert">Regulatory Expert</SelectItem>
            <SelectItem value="audit_assistant">Audit Assistant</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the assistant's purpose and capabilities"
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="tone">Response Tone</Label>
        <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="formal">Formal</SelectItem>
            <SelectItem value="friendly">Friendly</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="domainExpertise">Domain Expertise (comma-separated)</Label>
        <Input
          id="domainExpertise"
          value={formData.domainExpertise}
          onChange={(e) => setFormData({ ...formData, domainExpertise: e.target.value })}
          placeholder="e.g., NAAC, UGC, AICTE, Quality Assurance"
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button type="submit">Create Assistant</Button>
      </DialogFooter>
    </form>
  );
};

export default AIAssistantInterface;