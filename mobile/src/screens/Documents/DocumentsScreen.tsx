import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { theme } from '../../constants/theme';

interface Document {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'doc' | 'image' | 'other';
  category: 'regulatory' | 'standards' | 'accreditation' | 'internal';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  uploadDate: string;
  size: string;
  author: string;
}

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const categories = [
    { key: 'all', label: 'All Documents' },
    { key: 'regulatory', label: 'Regulatory' },
    { key: 'standards', label: 'Standards' },
    { key: 'accreditation', label: 'Accreditation' },
    { key: 'internal', label: 'Internal' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch documents from API
    setTimeout(() => {
      setDocuments([
        {
          id: '1',
          title: 'Q4 2024 Compliance Report',
          description: 'Quarterly compliance report for regulatory requirements',
          type: 'pdf',
          category: 'regulatory',
          status: 'approved',
          uploadDate: '2024-12-15',
          size: '2.3 MB',
          author: 'Admin User',
        },
        {
          id: '2',
          title: 'Standards Implementation Guide',
          description: 'Updated guidelines for standards compliance',
          type: 'doc',
          category: 'standards',
          status: 'submitted',
          uploadDate: '2024-12-14',
          size: '1.8 MB',
          author: 'Compliance Team',
        },
        {
          id: '3',
          title: 'Accreditation Evidence',
          description: 'Supporting documents for accreditation renewal',
          type: 'pdf',
          category: 'accreditation',
          status: 'draft',
          uploadDate: '2024-12-13',
          size: '4.1 MB',
          author: 'Quality Assurance',
        },
      ]);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    onRefresh();
  }, []);

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return theme.colors.success;
      case 'submitted': return theme.colors.info;
      case 'rejected': return theme.colors.error;
      case 'draft': return theme.colors.warning;
      default: return theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'submitted': return '📤';
      case 'rejected': return '❌';
      case 'draft': return '📝';
      default: return '📄';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'image': return '🖼️';
      default: return '📎';
    }
  };

  const DocumentCard = ({ document }: { document: Document }) => (
    <TouchableOpacity style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <View style={styles.documentInfo}>
          <Text style={styles.documentIcon}>{getFileIcon(document.type)}</Text>
          <View style={styles.documentDetails}>
            <Text style={styles.documentTitle}>{document.title}</Text>
            <Text style={styles.documentDescription}>{document.description}</Text>
            <Text style={styles.documentMeta}>
              {document.size} • {document.author} • {document.uploadDate}
            </Text>
          </View>
        </View>
        <View style={styles.documentActions}>
          <Text style={styles.statusIcon}>{getStatusIcon(document.status)}</Text>
          <Text style={[styles.statusText, { color: getStatusColor(document.status) }]}>
            {document.status.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const DocumentGridItem = ({ document }: { document: Document }) => (
    <TouchableOpacity style={styles.gridItem}>
      <View style={styles.gridIconContainer}>
        <Text style={styles.gridIcon}>{getFileIcon(document.type)}</Text>
      </View>
      <Text style={styles.gridTitle} numberOfLines={2}>{document.title}</Text>
      <Text style={styles.gridStatus} numberOfLines={1}>
        {document.status.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

  const CategoryTab = ({ category }: { category: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === category.key && styles.activeCategoryTab,
      ]}
      onPress={() => setSelectedCategory(category.key)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category.key && styles.activeCategoryText,
        ]}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  const renderDocument = ({ item }: { item: Document }) => (
    viewMode === 'list' ? <DocumentCard document={item} /> : <DocumentGridItem document={item} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Documents</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            <Text style={styles.viewModeIcon}>
              {viewMode === 'list' ? '⊞' : '⊟'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <CategoryTab key={category.key} category={category} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredDocuments}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id}
        key={viewMode === 'list' ? 'list' : 'grid'}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📁</Text>
            <Text style={styles.emptyStateTitle}>No documents found</Text>
            <Text style={styles.emptyStateDescription}>
              Upload your first document to get started.
            </Text>
          </View>
        }
        numColumns={viewMode === 'grid' ? 2 : 1}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridWrapper : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight as any,
    color: theme.colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  viewModeButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
  },
  viewModeIcon: {
    fontSize: 18,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: 'bold' as any,
  },
  categoriesContainer: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  content: {
    padding: theme.spacing.lg,
  },
  categoryTab: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
  },
  activeCategoryTab: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
  },
  activeCategoryText: {
    color: theme.colors.white,
  },
  documentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  documentInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  documentIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  documentDetails: {
    flex: 1,
  },
  documentTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight as any,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  documentMeta: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.tertiary,
  },
  documentActions: {
    alignItems: 'flex-end',
  },
  statusIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  statusText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'bold' as any,
  },
  gridWrapper: {
    justifyContent: 'space-between',
  },
  gridItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  gridIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  gridIcon: {
    fontSize: 24,
  },
  gridTitle: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.body.fontWeight as any,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  gridStatus: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyStateTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptyStateDescription: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});