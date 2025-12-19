import { useState, useEffect, useCallback } from 'react';
import { documentsService, Document, DocumentFilter } from '../services/documentsService';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async (filter: DocumentFilter = {}) => {
    try {
      const fetchedDocuments = await documentsService.getDocuments(filter);
      setDocuments(fetchedDocuments);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  }, []);

  const refreshDocuments = useCallback(async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  }, [fetchDocuments]);

  const uploadDocument = useCallback(async (documentData: FormData) => {
    try {
      setUploading(true);
      const newDocument = await documentsService.uploadDocument(documentData);
      setDocuments(prev => [newDocument, ...prev]);
      return newDocument;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  const updateDocument = useCallback(async (documentId: string, updateData: Partial<Document>) => {
    try {
      const updatedDocument = await documentsService.updateDocument(documentId, updateData);
      setDocuments(prev => 
        prev.map(doc => doc.id === documentId ? updatedDocument : doc)
      );
      return updatedDocument;
    } catch (error) {
      console.error('Failed to update document:', error);
      throw error;
    }
  }, []);

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      await documentsService.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }, []);

  const submitDocument = useCallback(async (documentId: string) => {
    try {
      const result = await documentsService.submitDocument(documentId);
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId ? { ...doc, status: 'submitted' } : doc
        )
      );
      return result;
    } catch (error) {
      console.error('Failed to submit document:', error);
      throw error;
    }
  }, []);

  const downloadDocument = useCallback(async (documentId: string): Promise<string | null> => {
    try {
      const downloadUrl = await documentsService.downloadDocument(documentId);
      return downloadUrl;
    } catch (error) {
      console.error('Failed to download document:', error);
      return null;
    }
  }, []);

  const getDocument = useCallback(async (documentId: string) => {
    try {
      return await documentsService.getDocument(documentId);
    } catch (error) {
      console.error('Failed to get document:', error);
      return null;
    }
  }, []);

  const searchDocuments = useCallback(async (query: string) => {
    try {
      const searchResults = await documentsService.searchDocuments(query);
      return searchResults;
    } catch (error) {
      console.error('Failed to search documents:', error);
      return [];
    }
  }, []);

  const getRecentDocuments = useCallback(async (limit: number = 5) => {
    try {
      return await documentsService.getRecentDocuments(limit);
    } catch (error) {
      console.error('Failed to get recent documents:', error);
      return [];
    }
  }, []);

  const getDocumentStats = useCallback(async () => {
    try {
      return await documentsService.getDocumentStats();
    } catch (error) {
      console.error('Failed to get document stats:', error);
      return {};
    }
  }, []);

  const getFilteredDocuments = useCallback((filter: DocumentFilter) => {
    let filtered = [...documents];
    
    if (filter.category) {
      filtered = filtered.filter(doc => doc.category === filter.category);
    }
    
    if (filter.status) {
      filtered = filtered.filter(doc => doc.status === filter.status);
    }
    
    if (filter.type) {
      filtered = filtered.filter(doc => doc.type === filter.type);
    }
    
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.description.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  }, [documents]);

  const getDocumentsByCategory = useCallback((category: string) => {
    return documents.filter(doc => doc.category === category);
  }, [documents]);

  const getDocumentsByStatus = useCallback((status: string) => {
    return documents.filter(doc => doc.status === status);
  }, [documents]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    refreshing,
    uploading,
    fetchDocuments,
    refreshDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    submitDocument,
    downloadDocument,
    getDocument,
    searchDocuments,
    getRecentDocuments,
    getDocumentStats,
    getFilteredDocuments,
    getDocumentsByCategory,
    getDocumentsByStatus,
  };
}