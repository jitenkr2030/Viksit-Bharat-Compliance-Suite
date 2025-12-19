import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="pt-12 pb-8">
            <div className="text-center space-y-6">
              {/* 404 Illustration */}
              <div className="relative">
                <div className="text-8xl font-bold text-blue-200 select-none">404</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl">🤔</div>
                </div>
              </div>

              {/* Error Message */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Page Not Found
                </h1>
                <p className="text-gray-600">
                  The page you're looking for doesn't exist or has been moved.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link to="/dashboard" className="block">
                  <Button className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </div>

              {/* Help Links */}
              <div className="pt-6 border-t">
                <p className="text-sm text-gray-500 mb-3">
                  Need help finding what you're looking for?
                </p>
                <div className="space-y-2">
                  <Link to="/search" className="block">
                    <Button variant="ghost" size="sm" className="w-full">
                      <Search className="mr-2 h-4 w-4" />
                      Search Content
                    </Button>
                  </Link>
                  <Link to="/help" className="block">
                    <Button variant="ghost" size="sm" className="w-full">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Get Help
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-3">Quick Access</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link to="/regulatory">
              <Button variant="outline" size="sm">
                Regulatory
              </Button>
            </Link>
            <Link to="/standards">
              <Button variant="outline" size="sm">
                Standards
              </Button>
            </Link>
            <Link to="/accreditation">
              <Button variant="outline" size="sm">
                Accreditation
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2024 PARSS - Penalty Avoidance & Regulatory Survival System. All rights reserved.</p>
          <p className="mt-1">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}