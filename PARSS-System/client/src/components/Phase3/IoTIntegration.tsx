// IoT Smart Campus Integration Component

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Wifi,
  Plus,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Battery,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Activity,
  Settings,
  Wrench,
} from 'lucide-react';
import { useIoTDevices, useIoTAlerts, useIoTAnalytics } from '@/hooks/usePhase3';
import { IoTDevice, IoTAlert } from '@/types/phase3';

interface IoTIntegrationProps {
  key?: number; // Used for forcing re-render
}

const IoTIntegration: React.FC<IoTIntegrationProps> = () => {
  const [activeTab, setActiveTab] = useState('devices');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    status: 'all',
    building: 'all',
  });
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const {
    devices,
    loading: devicesLoading,
    error: devicesError,
    total,
    createDevice,
    updateDevice,
    deleteDevice,
  } = useIoTDevices({
    page: 1,
    limit: 20,
    type: filters.type !== 'all' ? filters.type : undefined,
    category: filters.category !== 'all' ? filters.category : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    building: filters.building !== 'all' ? filters.building : undefined,
  });

  const {
    alerts,
    loading: alertsLoading,
    acknowledgeAlert,
    resolveAlert,
  } = useIoTAlerts({
    page: 1,
    limit: 50,
    status: 'active',
  });

  const {
    analytics,
    loading: analyticsLoading,
  } = useIoTAnalytics('7d');

  const handleCreateDevice = async (data: any) => {
    try {
      await createDevice(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create device:', error);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (window.confirm('Are you sure you want to delete this IoT device?')) {
      try {
        await deleteDevice(deviceId);
      } catch (error) {
        console.error('Failed to delete device:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'low_battery':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4" />;
      case 'offline':
        return <XCircle className="h-4 w-4" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low_battery':
        return <Battery className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getDeviceTypeIcon = (type: string) => {
    switch (type) {
      case 'temperature_sensor':
        return <Thermometer className="h-4 w-4" />;
      case 'humidity_sensor':
        return <Droplets className="h-4 w-4" />;
      case 'air_quality_sensor':
        return <Wind className="h-4 w-4" />;
      case 'environmental_sensor':
        return <Activity className="h-4 w-4" />;
      default:
        return <Wifi className="h-4 w-4" />;
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'emergency':
        return 'bg-red-100 text-red-900';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDevices = devices.filter(device =>
    searchQuery === '' ||
    device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.location.building.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (devicesLoading || alertsLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading IoT data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Wifi className="h-6 w-6 mr-2" />
            IoT Smart Campus
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor and manage IoT devices across the campus
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <MapPin className="h-4 w-4 mr-2" />
            Campus Map
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New IoT Device</DialogTitle>
                <DialogDescription>
                  Register a new IoT device for campus monitoring
                </DialogDescription>
              </DialogHeader>
              <CreateDeviceForm onSubmit={handleCreateDevice} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{analytics.deviceStats.total}</div>
              <p className="text-sm text-muted-foreground">Total Devices</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{analytics.deviceStats.active}</div>
              <p className="text-sm text-muted-foreground">Online</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{analytics.deviceStats.error}</div>
              <p className="text-sm text-muted-foreground">Errors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{analytics.alertStats.total}</div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="data">Sensor Data</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search devices..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Device Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="environmental_sensor">Environmental</SelectItem>
                    <SelectItem value="security_camera">Security Camera</SelectItem>
                    <SelectItem value="access_control">Access Control</SelectItem>
                    <SelectItem value="fire_detector">Fire Detector</SelectItem>
                    <SelectItem value="temperature_sensor">Temperature</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Devices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDevices.map((device) => (
              <Card key={device.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getDeviceTypeIcon(device.type)}
                      <CardTitle className="text-lg">{device.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(device.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(device.status)}
                        <span className="capitalize">{device.status}</span>
                      </div>
                    </Badge>
                  </div>
                  <CardDescription>
                    {device.location.building} - {device.location.floor} - {device.location.room}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Device ID:</span>
                      <p className="font-mono text-xs">{device.deviceId}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="capitalize">{device.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  {device.batteryLevel && (
                    <div className="flex items-center space-x-2">
                      <Battery className="h-4 w-4" />
                      <div className="flex-1">
                        <div className="text-sm">Battery: {device.batteryLevel}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${device.batteryLevel > 20 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${device.batteryLevel}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Last seen: {new Date(device.lastHeartbeat).toLocaleString()}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedDevice(device);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Wrench className="h-4 w-4 mr-2" />
                          Maintenance
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteDevice(device.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts ({alerts.length})</CardTitle>
              <CardDescription>
                Real-time alerts from IoT devices requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="font-medium">
                          {devices.find(d => d.id === alert.deviceId)?.name || 'Unknown Device'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {devices.find(d => d.id === alert.deviceId)?.location.building || 'Unknown Location'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{alert.alertType.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAlertSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{alert.message}</div>
                      </TableCell>
                      <TableCell>
                        {new Date(alert.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-2">
                          {!alert.acknowledged && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                          {!alert.resolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resolveAlert(alert.id, 'Resolved by user')}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Sensor Data</CardTitle>
              <CardDescription>
                Live data streaming from IoT sensors across campus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sample sensor data cards */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Temperature</p>
                      <p className="text-2xl font-bold text-blue-900">22.5°C</p>
                    </div>
                    <Thermometer className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-600 mt-2">Building A - Floor 1</p>
                </div>
                
                <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cyan-600">Humidity</p>
                      <p className="text-2xl font-bold text-cyan-900">45%</p>
                    </div>
                    <Droplets className="h-8 w-8 text-cyan-600" />
                  </div>
                  <p className="text-xs text-cyan-600 mt-2">Building A - Floor 1</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Air Quality</p>
                      <p className="text-2xl font-bold text-green-900">Good</p>
                    </div>
                    <Wind className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-xs text-green-600 mt-2">Campus Wide</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campus Coverage Map</CardTitle>
              <CardDescription>
                IoT device coverage across campus buildings and zones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Interactive campus map would be displayed here</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Showing device locations and coverage zones
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Device Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Device Details</DialogTitle>
            <DialogDescription>
              Detailed information and configuration for the IoT device
            </DialogDescription>
          </DialogHeader>
          {selectedDevice && (
            <DeviceDetailsView device={selectedDevice} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Create Device Form Component
const CreateDeviceForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    deviceId: '',
    name: '',
    type: 'environmental_sensor',
    category: 'environmental_monitoring',
    building: '',
    floor: '',
    room: '',
    zone: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      location: {
        building: formData.building,
        floor: formData.floor,
        room: formData.room,
        zone: formData.zone,
        address: `${formData.building}, Floor ${formData.floor}`,
      },
      status: 'offline',
      configuration: {
        samplingRate: 60,
        transmissionInterval: 300,
        alertThresholds: {},
        calibrationSettings: {
          autoCalibration: false,
          calibrationInterval: 30,
          lastCalibration: new Date(),
          nextCalibration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        dataFormat: 'json',
        encryptionEnabled: true,
        backupFrequency: 24,
        retentionPolicy: {
          rawDataRetention: 30,
          processedDataRetention: 90,
          aggregatedDataRetention: 365,
          compressAfter: 7,
          deleteAfter: 365,
        },
      },
      capabilities: [],
      lastHeartbeat: new Date(),
      firmwareVersion: '1.0.0',
      installationDate: new Date(),
      maintenanceSchedule: {
        frequency: 'monthly',
        lastMaintenance: new Date(),
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        tasks: [],
        assignedTo: 'System',
        estimatedDuration: 60,
      },
      alerts: [],
      complianceZones: [],
      dataRetentionPeriod: 30,
      isActive: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deviceId">Device ID</Label>
          <Input
            id="deviceId"
            value={formData.deviceId}
            onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
            placeholder="Unique device identifier"
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Device Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Human-readable name"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Device Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="environmental_sensor">Environmental Sensor</SelectItem>
              <SelectItem value="temperature_sensor">Temperature Sensor</SelectItem>
              <SelectItem value="humidity_sensor">Humidity Sensor</SelectItem>
              <SelectItem value="air_quality_sensor">Air Quality Sensor</SelectItem>
              <SelectItem value="security_camera">Security Camera</SelectItem>
              <SelectItem value="fire_detector">Fire Detector</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="environmental_monitoring">Environmental Monitoring</SelectItem>
              <SelectItem value="safety_security">Safety & Security</SelectItem>
              <SelectItem value="access_control">Access Control</SelectItem>
              <SelectItem value="emergency_systems">Emergency Systems</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="building">Building</Label>
          <Input
            id="building"
            value={formData.building}
            onChange={(e) => setFormData({ ...formData, building: e.target.value })}
            placeholder="Building name"
            required
          />
        </div>
        <div>
          <Label htmlFor="floor">Floor</Label>
          <Input
            id="floor"
            value={formData.floor}
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            placeholder="Floor number"
            required
          />
        </div>
        <div>
          <Label htmlFor="room">Room</Label>
          <Input
            id="room"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            placeholder="Room number"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="zone">Zone</Label>
        <Input
          id="zone"
          value={formData.zone}
          onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
          placeholder="Zone identifier"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input
            id="manufacturer"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            placeholder="Manufacturer name"
          />
        </div>
        <div>
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder="Model number"
          />
        </div>
        <div>
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input
            id="serialNumber"
            value={formData.serialNumber}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            placeholder="Serial number"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button type="submit">Add Device</Button>
      </DialogFooter>
    </form>
  );
};

// Device Details View Component
const DeviceDetailsView: React.FC<{ device: IoTDevice }> = ({ device }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Device Information</Label>
          <div className="space-y-2 text-sm">
            <div><strong>Name:</strong> {device.name}</div>
            <div><strong>ID:</strong> {device.deviceId}</div>
            <div><strong>Type:</strong> {device.type}</div>
            <div><strong>Category:</strong> {device.category}</div>
            <div><strong>Status:</strong> {device.status}</div>
            <div><strong>Manufacturer:</strong> {device.manufacturer}</div>
            <div><strong>Model:</strong> {device.model}</div>
            <div><strong>Serial Number:</strong> {device.serialNumber}</div>
          </div>
        </div>
        <div>
          <Label>Location</Label>
          <div className="space-y-2 text-sm">
            <div><strong>Building:</strong> {device.location.building}</div>
            <div><strong>Floor:</strong> {device.location.floor}</div>
            <div><strong>Room:</strong> {device.location.room}</div>
            <div><strong>Zone:</strong> {device.location.zone}</div>
            <div><strong>Address:</strong> {device.location.address}</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>System Information</Label>
          <div className="space-y-2 text-sm">
            <div><strong>Firmware:</strong> {device.firmwareVersion}</div>
            <div><strong>Installation:</strong> {new Date(device.installationDate).toLocaleDateString()}</div>
            <div><strong>Last Heartbeat:</strong> {new Date(device.lastHeartbeat).toLocaleString()}</div>
            {device.batteryLevel && (
              <div><strong>Battery:</strong> {device.batteryLevel}%</div>
            )}
          </div>
        </div>
        <div>
          <Label>Maintenance</Label>
          <div className="space-y-2 text-sm">
            <div><strong>Frequency:</strong> {device.maintenanceSchedule.frequency}</div>
            <div><strong>Last:</strong> {new Date(device.maintenanceSchedule.lastMaintenance).toLocaleDateString()}</div>
            <div><strong>Next:</strong> {new Date(device.maintenanceSchedule.nextMaintenance).toLocaleDateString()}</div>
            <div><strong>Assigned To:</strong> {device.maintenanceSchedule.assignedTo}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IoTIntegration;