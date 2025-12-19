// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

interface BundleSize {
  name: string;
  size: number;
  gzipSize: number;
}

// Core Web Vitals tracking
export class WebVitalsTracker {
  private static instance: WebVitalsTracker;
  private metrics: PerformanceMetrics[] = [];

  static getInstance(): WebVitalsTracker {
    if (!WebVitalsTracker.instance) {
      WebVitalsTracker.instance = new WebVitalsTracker();
    }
    return WebVitalsTracker.instance;
  }

  // Track Core Web Vitals
  trackWebVitals() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      this.recordMetric('LCP', lastEntry.startTime, 'ms');
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.recordMetric('FID', entry.processingStart - entry.startTime, 'ms');
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.recordMetric('CLS', clsValue, '');
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }

  private recordMetric(name: string, value: number, unit: string) {
    const metric: PerformanceMetrics = {
      name,
      value,
      unit,
      timestamp: Date.now(),
    };
    
    this.metrics.push(metric);
    
    // Send to analytics service
    this.sendToAnalytics(metric);
  }

  private async sendToAnalytics(metric: PerformanceMetrics) {
    try {
      await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      console.warn('Failed to send Web Vitals to analytics:', error);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }
}

// Bundle size monitoring
export class BundleAnalyzer {
  static async analyzeBundle(): Promise<BundleSize[]> {
    if (typeof window === 'undefined') return [];

    const sizes: BundleSize[] = [];
    
    // Get performance entries
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    
    if (entries.length > 0) {
      const entry = entries[0];
      
      // Calculate transfer sizes (approximate)
      sizes.push({
        name: 'HTML',
        size: entry.responseEnd - entry.responseStart,
        gzipSize: (entry.responseEnd - entry.responseStart) * 0.3, // Rough estimate
      });
    }

    // Get resource timings
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    resourceEntries.forEach((resource) => {
      const url = new URL(resource.name);
      const isJS = url.pathname.endsWith('.js');
      const isCSS = url.pathname.endsWith('.css');
      
      if (isJS || isCSS) {
        sizes.push({
          name: url.pathname.split('/').pop() || 'unknown',
          size: resource.transferSize || 0,
          gzipSize: (resource.transferSize || 0) * 0.3,
        });
      }
    });

    return sizes;
  }
}

// Performance budget checker
export class PerformanceBudget {
  private static budgets = {
    'js-bundle': 250 * 1024, // 250KB
    'css-bundle': 50 * 1024, // 50KB
    'images': 500 * 1024, // 500KB
    'fonts': 100 * 1024, // 100KB
  };

  static async checkBudget(): Promise<{ [key: string]: boolean }> {
    const bundleSizes = await BundleAnalyzer.analyzeBundle();
    const results: { [key: string]: boolean } = {};

    bundleSizes.forEach((bundle) => {
      if (bundle.name.endsWith('.js')) {
        results['js-bundle'] = bundle.size <= this.budgets['js-bundle'];
      } else if (bundle.name.endsWith('.css')) {
        results['css-bundle'] = bundle.size <= this.budgets['css-bundle'];
      }
    });

    return results;
  }
}

// API response time monitoring
export class APIMonitor {
  private static requests: { url: string; duration: number; timestamp: number }[] = [];

  static trackRequest(url: string, duration: number) {
    this.requests.push({
      url,
      duration,
      timestamp: Date.now(),
    });

    // Keep only last 100 requests
    if (this.requests.length > 100) {
      this.requests.shift();
    }

    // Alert if response time is too slow
    if (duration > 3000) { // 3 seconds
      console.warn(`Slow API request detected: ${url} took ${duration}ms`);
    }
  }

  static getAverageResponseTime(): number {
    if (this.requests.length === 0) return 0;
    
    const total = this.requests.reduce((sum, req) => sum + req.duration, 0);
    return total / this.requests.length;
  }

  static getSlowRequests(): typeof this.requests {
    return this.requests.filter(req => req.duration > 2000); // > 2 seconds
  }
}

// Memory usage monitoring
export class MemoryMonitor {
  static getMemoryInfo() {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }

  static checkMemoryLeak() {
    const memory = this.getMemoryInfo();
    if (!memory) return;

    // Alert if memory usage is over 80%
    if (memory.usedPercentage > 80) {
      console.warn('High memory usage detected:', memory);
    }
  }
}

// Automatic performance reporting
export class PerformanceReporter {
  static async report() {
    if (typeof window === 'undefined') return;

    const report = {
      webVitals: WebVitalsTracker.getInstance().getMetrics(),
      bundleSizes: await BundleAnalyzer.analyzeBundle(),
      budgetCompliance: await PerformanceBudget.checkBudget(),
      apiPerformance: {
        averageResponseTime: APIMonitor.getAverageResponseTime(),
        slowRequests: APIMonitor.getSlowRequests().length,
      },
      memoryInfo: MemoryMonitor.getMemoryInfo(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.warn('Failed to send performance report:', error);
    }
  }
}

// Initialize performance monitoring
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Start Web Vitals tracking
  WebVitalsTracker.getInstance().trackWebVitals();

  // Set up periodic checks
  setInterval(() => {
    MemoryMonitor.checkMemoryLeak();
  }, 30000); // Check every 30 seconds

  // Report performance on page unload
  window.addEventListener('beforeunload', () => {
    PerformanceReporter.report();
  });

  // Report performance every 5 minutes
  setInterval(() => {
    PerformanceReporter.report();
  }, 5 * 60 * 1000);
}

// Utility function to measure function execution time
export function measureExecutionTime<T>(fn: () => T, name?: string): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`Execution time${name ? ` for ${name}` : ''}: ${end - start}ms`);
  return result;
}

// Utility function to measure async function execution time
export async function measureAsyncExecutionTime<T>(fn: () => Promise<T>, name?: string): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`Async execution time${name ? ` for ${name}` : ''}: ${end - start}ms`);
  return result;
}

// API request wrapper with performance tracking
export async function trackedFetch(url: string, options?: RequestInit): Promise<Response> {
  const start = performance.now();
  
  try {
    const response = await fetch(url, options);
    const end = performance.now();
    const duration = end - start;
    
    APIMonitor.trackRequest(url, duration);
    return response;
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    
    APIMonitor.trackRequest(url, duration);
    throw error;
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === 'undefined') return;

  const startTime = performance.now();
  
  // Log component mount time
  const endTime = performance.now();
  const mountTime = endTime - startTime;
  
  if (mountTime > 16) { // Slower than one frame (16ms)
    console.warn(`Slow component mount: ${componentName} took ${mountTime}ms`);
  }
}

// Initialize performance monitoring on import
initializePerformanceMonitoring();