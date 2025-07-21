import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  memoryUsage: number;
  renderTime: number;
  componentMounts: number;
  apiCalls: number;
}

interface PerformanceMonitorOptions {
  trackMemory?: boolean;
  trackRenders?: boolean;
  trackApiCalls?: boolean;
  logToConsole?: boolean;
}

export const usePerformanceMonitor = (
  componentName: string,
  options: PerformanceMonitorOptions = {}
) => {
  const {
    trackMemory = true,
    trackRenders = true,
    trackApiCalls = true,
    logToConsole = process.env.NODE_ENV === 'development'
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    renderTime: 0,
    componentMounts: 0,
    apiCalls: 0
  });

  const renderStartTime = useRef<number>(0);
  const mountCount = useRef<number>(0);
  const apiCallCount = useRef<number>(0);

  // Track component mounts
  useEffect(() => {
    mountCount.current += 1;
    
    if (logToConsole) {
      console.log(`🔄 ${componentName} mounted (${mountCount.current} times)`);
    }

    setMetrics(prev => ({
      ...prev,
      componentMounts: mountCount.current
    }));

    return () => {
      if (logToConsole) {
        console.log(`🔄 ${componentName} unmounted`);
      }
    };
  }, [componentName, logToConsole]);

  // Track render performance
  useEffect(() => {
    if (!trackRenders) return;

    renderStartTime.current = performance.now();

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      
      setMetrics(prev => ({
        ...prev,
        renderTime
      }));

      if (logToConsole && renderTime > 16) { // Warn if render takes longer than 16ms
        console.warn(`⚠️ ${componentName} slow render: ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  // Track memory usage
  useEffect(() => {
    if (!trackMemory || !('memory' in performance)) return;

    const updateMemoryUsage = () => {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB

      setMetrics(prev => ({
        ...prev,
        memoryUsage
      }));

      if (logToConsole && memoryUsage > 100) { // Warn if memory usage exceeds 100MB
        console.warn(`🧠 ${componentName} high memory usage: ${memoryUsage.toFixed(2)}MB`);
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [componentName, trackMemory, logToConsole]);

  // API call tracker
  const trackApiCall = (apiName: string, duration?: number) => {
    if (!trackApiCalls) return;

    apiCallCount.current += 1;
    
    setMetrics(prev => ({
      ...prev,
      apiCalls: apiCallCount.current
    }));

    if (logToConsole) {
      const durationText = duration ? ` (${duration.toFixed(2)}ms)` : '';
      console.log(`📡 ${componentName} API call: ${apiName}${durationText}`);
    }
  };

  // Performance report
  const getPerformanceReport = () => {
    return {
      component: componentName,
      metrics,
      timestamp: new Date().toISOString(),
      recommendations: generateRecommendations(metrics)
    };
  };

  return {
    metrics,
    trackApiCall,
    getPerformanceReport
  };
};

const generateRecommendations = (metrics: PerformanceMetrics): string[] => {
  const recommendations: string[] = [];

  if (metrics.renderTime > 16) {
    recommendations.push('Consider optimizing render performance with React.memo or useMemo');
  }

  if (metrics.memoryUsage > 100) {
    recommendations.push('High memory usage detected - check for memory leaks');
  }

  if (metrics.componentMounts > 5) {
    recommendations.push('Component is mounting frequently - check parent re-renders');
  }

  if (metrics.apiCalls > 10) {
    recommendations.push('High number of API calls - consider caching or batching');
  }

  return recommendations;
};

// Global performance monitor for tracking app-wide metrics
class GlobalPerformanceMonitor {
  private static instance: GlobalPerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  static getInstance(): GlobalPerformanceMonitor {
    if (!GlobalPerformanceMonitor.instance) {
      GlobalPerformanceMonitor.instance = new GlobalPerformanceMonitor();
    }
    return GlobalPerformanceMonitor.instance;
  }

  updateMetrics(componentName: string, metrics: PerformanceMetrics) {
    this.metrics.set(componentName, metrics);
  }

  getGlobalReport() {
    const totalMemory = Array.from(this.metrics.values())
      .reduce((sum, metric) => sum + metric.memoryUsage, 0);

    const totalApiCalls = Array.from(this.metrics.values())
      .reduce((sum, metric) => sum + metric.apiCalls, 0);

    const slowComponents = Array.from(this.metrics.entries())
      .filter(([_, metric]) => metric.renderTime > 16)
      .map(([name]) => name);

    return {
      totalComponents: this.metrics.size,
      totalMemoryUsage: totalMemory,
      totalApiCalls,
      slowComponents,
      timestamp: new Date().toISOString()
    };
  }
}

export const globalPerformanceMonitor = GlobalPerformanceMonitor.getInstance();