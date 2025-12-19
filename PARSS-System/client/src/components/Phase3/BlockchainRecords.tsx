// Blockchain Records Management Component

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
  Shield,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
} from 'lucide-react';
import { useBlockchainRecords, useBlockchainTransactions, useBlockchainAnalytics } from '@/hooks/usePhase3';
import { BlockchainRecord, BlockchainTransaction } from '@/types/phase3';

interface BlockchainRecordsProps {
  key?: number; // Used for forcing re-render
}

const BlockchainRecords: React.FC<BlockchainRecordsProps> = () => {
  const [activeTab, setActiveTab] = useState('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    dataType: 'all',
    networkType: 'all',
    isVerified: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<BlockchainRecord | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const {
    records,
    loading: recordsLoading,
    error: recordsError,
    total,
    page,
    totalPages,
    createRecord,
    updateRecord,
    deleteRecord,
    verifyRecord,
  } = useBlockchainRecords({
    page: currentPage,
    limit: 10,
    dataType: filters.dataType !== 'all' ? filters.dataType : undefined,
    networkType: filters.networkType !== 'all' ? filters.networkType : undefined,
    isVerified: filters.isVerified !== 'all' ? filters.isVerified === 'true' : undefined,
  });

  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
  } = useBlockchainTransactions({
    page: 1,
    limit: 20,
  });

  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useBlockchainAnalytics('7d');

  const handleCreateRecord = async (data: any) => {
    try {
      await createRecord(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create record:', error);
    }
  };

  const handleVerifyRecord = async (recordId: string) => {
    try {
      await verifyRecord(recordId);
    } catch (error) {
      console.error('Failed to verify record:', error);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this blockchain record?')) {
      try {
        await deleteRecord(recordId);
      } catch (error) {
        console.error('Failed to delete record:', error);
      }
    }
  };

  const getVerificationStatus = (record: BlockchainRecord) => {
    if (record.isVerified) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  const getDataTypeColor = (dataType: string) => {
    switch (dataType) {
      case 'compliance':
        return 'bg-blue-100 text-blue-800';
      case 'document':
        return 'bg-purple-100 text-purple-800';
      case 'accreditation':
        return 'bg-green-100 text-green-800';
      case 'audit':
        return 'bg-orange-100 text-orange-800';
      case 'report':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNetworkTypeColor = (networkType: string) => {
    return networkType === 'mainnet' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
  };

  const filteredRecords = records.filter(record =>
    searchQuery === '' ||
    record.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.metadata.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.recordHash.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (recordsLoading || transactionsLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading blockchain data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            Blockchain Records
          </h2>
          <p className="text-gray-600 mt-1">
            Manage immutable compliance records on blockchain
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Blockchain Record</DialogTitle>
                <DialogDescription>
                  Create a new immutable compliance record on the blockchain
                </DialogDescription>
              </DialogHeader>
              <CreateRecordForm onSubmit={handleCreateRecord} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{analytics.totalRecords}</div>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {analytics.recordsByType?.compliance || 0}
              </div>
              <p className="text-sm text-muted-foreground">Compliance Records</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {analytics.networkStats?.mainnet?.records || 0}
              </div>
              <p className="text-sm text-muted-foreground">Mainnet Records</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {analytics.networkStats?.testnet?.records || 0}
              </div>
              <p className="text-sm text-muted-foreground">Testnet Records</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search records..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filters.dataType} onValueChange={(value) => setFilters({ ...filters, dataType: value })}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Data Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="accreditation">Accreditation</SelectItem>
                    <SelectItem value="audit">Audit</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.networkType} onValueChange={(value) => setFilters({ ...filters, networkType: value })}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Networks</SelectItem>
                    <SelectItem value="mainnet">Mainnet</SelectItem>
                    <SelectItem value="testnet">Testnet</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.isVerified} onValueChange={(value) => setFilters({ ...filters, isVerified: value })}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Records ({filteredRecords.length})</CardTitle>
              <CardDescription>
                Immutable compliance records stored on blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.metadata.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.metadata.description.substring(0, 50)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDataTypeColor(record.dataType)}>
                          {record.dataType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getNetworkTypeColor(record.networkType)}>
                          {record.networkType}
                        </Badge>
                      </TableCell>
                      <TableCell>{getVerificationStatus(record)}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {record.blockNumber}
                        </code>
                      </TableCell>
                      <TableCell>
                        {new Date(record.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedRecord(record);
                              setIsViewDialogOpen(true);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`https://blockchain.com/tx/${record.transactionHash}`, '_blank')}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View on Blockchain
                            </DropdownMenuItem>
                            {!record.isVerified && (
                              <DropdownMenuItem onClick={() => handleVerifyRecord(record.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verify
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteRecord(record.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} records
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Blockchain transactions for record creation and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction Hash</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gas Used</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {transaction.transactionHash.substring(0, 16)}...
                        </code>
                      </TableCell>
                      <TableCell>{transaction.blockNumber}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === 'confirmed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.gasUsed.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Record Details</DialogTitle>
            <DialogDescription>
              Detailed information about the blockchain record
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <RecordDetailsView record={selectedRecord} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Create Record Form Component
const CreateRecordForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    dataType: 'compliance',
    networkType: 'testnet' as 'testnet' | 'mainnet',
    title: '',
    description: '',
    category: '',
    tags: '',
    data: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      dataType: formData.dataType,
      data: formData.data ? JSON.parse(formData.data) : {},
      metadata: {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        version: '1.0',
        author: 'Current User',
        checksum: '',
      },
      networkType: formData.networkType,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dataType">Data Type</Label>
          <Select value={formData.dataType} onValueChange={(value) => setFormData({ ...formData, dataType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="accreditation">Accreditation</SelectItem>
              <SelectItem value="audit">Audit</SelectItem>
              <SelectItem value="report">Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="networkType">Network</Label>
          <Select value={formData.networkType} onValueChange={(value: 'testnet' | 'mainnet') => setFormData({ ...formData, networkType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="testnet">Testnet</SelectItem>
              <SelectItem value="mainnet">Mainnet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Record title"
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Record description"
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="Record category"
        />
      </div>
      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="tag1, tag2, tag3"
        />
      </div>
      <div>
        <Label htmlFor="data">Data (JSON format)</Label>
        <Textarea
          id="data"
          value={formData.data}
          onChange={(e) => setFormData({ ...formData, data: e.target.value })}
          placeholder='{"key": "value"}'
          rows={4}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button type="submit">Create Record</Button>
      </DialogFooter>
    </form>
  );
};

// Record Details View Component
const RecordDetailsView: React.FC<{ record: BlockchainRecord }> = ({ record }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Record Hash</Label>
          <code className="block text-sm bg-gray-100 p-2 rounded">
            {record.recordHash}
          </code>
        </div>
        <div>
          <Label>Transaction Hash</Label>
          <code className="block text-sm bg-gray-100 p-2 rounded">
            {record.transactionHash}
          </code>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Block Number</Label>
          <p className="text-sm">{record.blockNumber}</p>
        </div>
        <div>
          <Label>Chain ID</Label>
          <p className="text-sm">{record.chainId}</p>
        </div>
      </div>
      <div>
        <Label>Metadata</Label>
        <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(record.metadata, null, 2)}
        </pre>
      </div>
      <div>
        <Label>Data</Label>
        <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(record.data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default BlockchainRecords;