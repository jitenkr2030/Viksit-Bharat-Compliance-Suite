#!/bin/bash

# Comprehensive fix for ALL import paths in the client src directory
cd /workspace/client/src

echo "🔧 Fixing ALL import paths to use @ alias..."

# Fix UI component imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../ui/|from '@/components/ui/|g"
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../ui/|from '@/components/ui/|g"
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../../ui/|from '@/components/ui/|g"

# Fix context imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../contexts/|from '@/contexts/|g"
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../contexts/|from '@/contexts/|g"

# Fix component imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../components/|from '@/components/|g"
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../components/|from '@/components/|g"
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../../components/|from '@/components/|g"

# Fix page imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../pages/|from '@/pages/|g"
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../pages/|from '@/pages/|g"

# Fix hook imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../hooks/|from '@/hooks/|g"
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../hooks/|from '@/hooks/|g"

# Fix service imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../services/|from '@/services/|g"
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../services/|from '@/services/|g"

# Fix type imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../types/|from '@/types/|g"
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../types/|from '@/types/|g"

# Fix API imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../api/|from '@/api/|g"
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../api/|from '@/api/|g"

# Fix lib imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../lib/|from '@/lib/|g"
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../lib/|from '@/lib/|g"
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from './lib/|from '@/lib/|g"

echo "✅ All import paths fixed successfully!"