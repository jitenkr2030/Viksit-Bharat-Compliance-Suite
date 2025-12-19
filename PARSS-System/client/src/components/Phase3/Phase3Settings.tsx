// Phase 3 Settings Component

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Settings,
  Shield,
  Wifi,
  Brain,
  Save,
  RefreshCw,
  Download,
  Upload,
  Key,
  Database,
  Network,
  Bell,
  User,
  Lock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
} from 'lucide-react';

interface Phase3SettingsProps {
  key?: number; // Used for forcing re-render
}

const Phase3Settings: React.FC<Phase3SettingsProps> = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    systemName: 'Viksit Bharat Compliance Suite',
    organizationName: 'Viksit Bharat University',
    timezone: 'Asia/Kolkata',
    language: 'en',
    enableNotifications: true,
    enableRealTimeUpdates: true,
    
    // Blockchain Settings
    defaultNetwork: 'testnet',
    autoVerification: true,
    gasPrice: '20',
    confirmationBlocks: 12,
    ipfsEnabled: true,
    encryptionEnabled: true,
    
    // IoT Settings
    dataRetentionDays: 90,
    samplingRate: 60,
    transmissionInterval: 300,
    alertThresholds: {
      temperature: { min: 15, max: 35 },
      humidity: { min: 30, max: 70 },
      airQuality: { min: 50, max: 200 },
    },
    enablePredict,
    predictiveMaintenance: true,
    alertLevel: 20,
    
    // AI Assistant Settings
    aiModel: 'gpt-4',
    responseTimeout: 30,
    maxTokens: 2000,
    temperature: 0.7,
    enableContextMemory: true,
    knowledgeBaseUpdateInterval: 24,
    
    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: 60,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    encryptionLevel: 'AES-256',
    
    // Integration Settings
    webhookUrl: '',
    apiRateLimit: 1000,
    enableCORS: true,
    allowedOrigins: ['http://localhost:3000'],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNestedSettingChange = (parent: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save settings. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      window.location.reload();
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'phase3-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          setSaveMessage('Settings imported successfully!');
          setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
          setSaveMessage('Invalid settings file. Please check the format.');
          setTimeout(() => setSaveMessage(''), 3000);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Settings className="h-6 w-6 mr-2" />
            Phase 3 Settings
          </h2>
          <p className="text-gray-600 mt-1">
            Configure system-wide settings for blockchain, IoT, and AI components
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".json"
            onChange={handleImportSettings}
            className="hidden"
            id="import-settings"
          />
          <label htmlFor="import-settings">
            <Button variant="outline" size="sm" asChild>
              <span className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
          </label>
          <Button variant="outline" size="sm" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <Alert className={saveMessage.includes('Failed') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className={saveMessage.includes('Failed') ? 'text-red-800' : 'text-green-800'}>
            {saveMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Blockchain</span>
          </TabsTrigger>
          <TabsTrigger value="iot" className="flex items-center space-x-2">
            <Wifi className="h-4 w-4" />
            <span>IoT</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>AI Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center space-x-2">
            <Network className="h-4 w-4" />
            <span>Integration</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Basic system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="systemName">System Name</Label>
                  <Input
                    id="systemName"
                    value={settings.systemName}
                    onChange={(e) => handleSettingChange('systemName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    value={settings.organizationName}
                    onChange={(e) => handleSettingChange('organizationName', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableNotifications">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive system notifications and alerts
                    </p>
                  </div>
                  <Switch
                    id="enableNotifications"
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableRealTimeUpdates">Real-time Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable real-time data synchronization
                    </p>
                  </div>
                  <Switch
                    id="enableRealTimeUpdates"
                    checked={settings.enableRealTimeUpdates}
                    onCheckedChange={(checked) => handleSettingChange('enableRealTimeUpdates', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blockchain Settings */}
        <TabsContent value="blockchain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Configuration</CardTitle>
              <CardDescription>
                Settings for blockchain record management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultNetwork">Default Network</Label>
                  <Select value={settings.defaultNetwork} onValueChange={(value) => handleSettingChange('defaultNetwork', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="testnet">Testnet</SelectItem>
                      <SelectItem value="mainnet">Mainnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gasPrice">Gas Price (Gwei)</Label>
                  <Input
                    id="gasPrice"
                    type="number"
                    value={settings.gasPrice}
                    onChange={(e) => handleSettingChange('gasPrice', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="confirmationBlocks">Confirmation Blocks</Label>
                  <Input
                    id="confirmationBlocks"
                    type="number"
                    value={settings.confirmationBlocks}
                    onChange={(e) => handleSettingChange('confirmationBlocks', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoVerification">Auto Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically verify blockchain records
                    </p>
                  </div>
                  <Switch
                    id="autoVerification"
                    checked={settings.autoVerification}
                    onCheckedChange={(checked) => handleSettingChange('autoVerification', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ipfsEnabled">IPFS Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Store large files on IPFS
                    </p>
                  </div>
                  <Switch
                    id="ipfsEnabled"
                    checked={settings.ipfsEnabled}
                    onCheckedChange={(checked) => handleSettingChange('ipfsEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="encryptionEnabled">Data Encryption</Label>
                    <p className="text-sm text-muted-foreground">
                      Encrypt sensitive data before storing
                    </p>
                  </div>
                  <Switch
                    id="encryptionEnabled"
                    checked={settings.encryptionEnabled}
                    onCheckedChange={(checked) => handleSettingChange('encryptionEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IoT Settings */}
        <TabsContent value="iot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>IoT Device Configuration</CardTitle>
              <CardDescription>
                Settings for IoT device management and data collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dataRetentionDays">Data Retention (Days)</Label>
                  <Input
                    id="dataRetentionDays"
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="samplingRate">Sampling Rate (Seconds)</Label>
                  <Input
                    id="samplingRate"
                    type="number"
                    value={settings.samplingRate}
                    onChange={(e) => handleSettingChange('samplingRate', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="transmissionInterval">Transmission Interval (Seconds)</Label>
                  <Input
                    id="transmissionInterval"
                    type="number"
                    value={settings.transmissionInterval}
                    onChange={(e) => handleSettingChange('transmissionInterval', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batteryAlertLevel">Battery Alert Level (%)</Label>
                  <Input
                    id="batteryAlertLevel"
                    type="number"
                    value={settings.batteryAlertLevel}
                    onChange={(e) => handleSettingChange('batteryAlertLevel', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enablePredictiveMaintenance">Predictive Maintenance</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable AI-powered maintenance predictions
                    </p>
                  </div>
                  <Switch
                    id="enablePredictiveMaintenance"
                    checked={settings.enablePredictiveMaintenance}
                    onCheckedChange={(checked) => handleSettingChange('enablePredictiveMaintenance', checked)}
                  />
                </div>
              </div>

              <div>
                <Label>Alert Thresholds</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="tempMin">Temperature Min (°C)</Label>
                    <Input
                      id="tempMin"
                      type="number"
                      value={settings.alertThresholds.temperature.min}
                      onChange={(e) => handleNestedSettingChange('alertThresholds', 'temperature', {
                        ...settings.alertThresholds.temperature,
                        min: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tempMax">Temperature Max (°C)</Label>
                    <Input
                      id="tempMax"
                      type="number"
                      value={settings.alertThresholds.temperature.max}
                      onChange={(e) => handleNestedSettingChange('alertThresholds', 'temperature', {
                        ...settings.alertThresholds.temperature,
                        max: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="humidityMin">Humidity Min (%)</Label>
                    <Input
                      id="humidityMin"
                      type="number"
                      value={settings.alertThresholds.humidity.min}
                      onChange={(e) => handleNestedSettingChange('alertThresholds', 'humidity', {
                        ...settings.alertThresholds.humidity,
                        min: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Assistant Settings */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Configuration</CardTitle>
              <CardDescription>
                Settings for AI assistant behavior and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aiModel">AI Model</Label>
                  <Select value={settings.aiModel} onValueChange={(value) => handleSettingChange('aiModel', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                      <SelectItem value="custom">Custom Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="responseTimeout">Response Timeout (Seconds)</Label>
                  <Input
                    id="responseTimeout"
                    type="number"
                    value={settings.responseTimeout}
                    onChange={(e) => handleSettingChange('responseTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={settings.maxTokens}
                    onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Temperature (Creativity)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={settings.temperature}
                    onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="knowledgeBaseUpdateInterval">Knowledge Base Update Interval (Hours)</Label>
                  <Input
                    id="knowledgeBaseUpdateInterval"
                    type="number"
                    value={settings.knowledgeBaseUpdateInterval}
                    onChange={(e) => handleSettingChange('knowledgeBaseUpdateInterval', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableContextMemory">Context Memory</Label>
                    <p className="text-sm text-muted-foreground">
                      Remember conversation context across sessions
                    </p>
                  </div>
                  <Switch
                    id="enableContextMemory"
                    checked={settings.enableContextMemory}
                    onCheckedChange={(checked) => handleSettingChange('enableContextMemory', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>
                Security settings and access control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="encryptionLevel">Encryption Level</Label>
                  <Select value={settings.encryptionLevel} onValueChange={(value) => handleSettingChange('encryptionLevel', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AES-128">AES-128</SelectItem>
                      <SelectItem value="AES-256">AES-256</SelectItem>
                      <SelectItem value="RSA-2048">RSA-2048</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for user authentication
                    </p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                  />
                </div>
              </div>

              <div>
                <Label>Password Policy</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="minLength">Minimum Length</Label>
                    <Input
                      id="minLength"
                      type="number"
                      value={settings.passwordPolicy.minLength}
                      onChange={(e) => handleNestedSettingChange('passwordPolicy', 'minLength', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireUppercase">Require Uppercase</Label>
                    <Switch
                      id="requireUppercase"
                      checked={settings.passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) => handleNestedSettingChange('passwordPolicy', 'requireUppercase', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireLowercase">Require Lowercase</Label>
                    <Switch
                      id="requireLowercase"
                      checked={settings.passwordPolicy.requireLowercase}
                      onCheckedChange={(checked) => handleNestedSettingChange('passwordPolicy', 'requireLowercase', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireNumbers">Require Numbers</Label>
                    <Switch
                      id="requireNumbers"
                      checked={settings.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) => handleNestedSettingChange('passwordPolicy', 'requireNumbers', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                    <Switch
                      id="requireSpecialChars"
                      checked={settings.passwordPolicy.requireSpecialChars}
                      onCheckedChange={(checked) => handleNestedSettingChange('passwordPolicy', 'requireSpecialChars', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Configuration</CardTitle>
              <CardDescription>
                External integrations and API settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={settings.webhookUrl}
                  onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
                  placeholder="https://your-domain.com/webhook"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apiRateLimit">API Rate Limit (Requests/Hour)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="allowedOrigins">Allowed Origins (CORS)</Label>
                <Textarea
                  id="allowedOrigins"
                  value={settings.allowedOrigins.join('\n')}
                  onChange={(e) => handleSettingChange('allowedOrigins', e.target.value.split('\n').filter(Boolean))}
                  placeholder="http://localhost:3000&#10;https://your-domain.com"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableCORS">Enable CORS</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow cross-origin requests
                    </p>
                  </div>
                  <Switch
                    id="enableCORS"
                    checked={settings.enableCORS}
                    onCheckedChange={(checked) => handleSettingChange('enableCORS', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Phase3Settings;