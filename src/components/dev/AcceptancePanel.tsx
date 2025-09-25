"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getAcceptanceTestRunner, TestResult } from "@/lib/tests/acceptance/runner";

/**
 * Acceptance Test Panel - Development Only
 * Provides UI for running acceptance tests and viewing results
 * Maps to §17 specification test suites
 */
export default function AcceptancePanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [lastRunMeta, setLastRunMeta] = useState<{
    timestamp: number;
    buildId: string;
    blockRelease: boolean;
  } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const runner = getAcceptanceTestRunner();

  const runAllTests = async () => {
    setIsRunning(true);
    try {
      const testResults = await runner.runAll();
      setResults(testResults);
      
      const lastRun = testResults.length > 0 ? {
        timestamp: Math.max(...testResults.map(r => r.timestamp)),
        buildId: testResults[0]?.buildId || '',
        blockRelease: runner.getBlockReleaseFlag()
      } : null;
      
      setLastRunMeta(lastRun);
    } catch (error) {
      console.error('Failed to run acceptance tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runSingleTest = async (scenarioId: string) => {
    setIsRunning(true);
    try {
      const result = await runner.runScenario(scenarioId);
      setResults(prev => {
        const filtered = prev.filter(r => r.scenarioId !== scenarioId);
        return [...filtered, result];
      });
    } catch (error) {
      console.error(`Failed to run test ${scenarioId}:`, error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'PASS':
        return <Badge variant="success">PASS</Badge>;
      case 'FAIL':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="secondary">PENDING</Badge>;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'PASS':
        return 'text-green-600';
      case 'FAIL':
        return 'text-red-600';
      case 'PENDING':
      default:
        return 'text-gray-600';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    return `${duration}ms`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🧪 Acceptance Test Harness
            <Badge variant="outline" className="text-xs">
              Dev Only
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
          >
            {isExpanded ? "▼" : "▶"}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {/* Warning Notice */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-yellow-600 text-lg">⚠️</span>
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Development-Only Testing</p>
                <p>
                  This is a client-side test harness for development purposes only. 
                  Real CI/CD will enforce §18 Gatekeeping with proper test infrastructure.
                </p>
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-4 flex items-center gap-2">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Running Tests...
                </>
              ) : (
                <>
                  🚀 Run All Tests
                </>
              )}
            </Button>
            
            {lastRunMeta && (
              <div className="text-sm text-gray-600">
                Last run: {formatTimestamp(lastRunMeta.timestamp)}
                {lastRunMeta.blockRelease && (
                  <span className="ml-2 text-red-600 font-medium">🚫 BLOCK RELEASE</span>
                )}
              </div>
            )}
          </div>

          {/* Test Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Test Results</h4>
              <div className="space-y-1">
                {results.map((result) => (
                  <div
                    key={result.scenarioId}
                    className={`flex items-center justify-between p-2 rounded border ${
                      result.status === 'PASS' ? 'bg-green-50 border-green-200' :
                      result.status === 'FAIL' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getStatusBadge(result.status)}
                      <span className="font-mono text-sm">{result.scenarioId}</span>
                      <span className="text-sm text-gray-600">
                        {result.duration && `(${formatDuration(result.duration)})`}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runSingleTest(result.scenarioId)}
                        disabled={isRunning}
                        className="text-xs"
                      >
                        Re-run
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Scenarios Info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-sm text-blue-900 mb-2">
              Available Test Scenarios (Maps to §17)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-800">
              <div>• AT-ORD-01: Auto Replenishment</div>
              <div>• AT-REC-02: Warehouse UPC Alias</div>
              <div>• AT-VAR-01: Variance Approval</div>
              <div>• AT-FIN-03: Budget Threshold Alert</div>
              <div>• AT-AUD-01: Audit Trail Verification</div>
              <div>• AT-ROLE-01: Role-Based Access Control</div>
              <div>• AT-KPI-01: KPI Dashboard Verification</div>
              <div>• AT-TABLE-01: Data Table Command Actions</div>
            </div>
          </div>

          {/* Console Note */}
          <div className="mt-4 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
            <p className="font-medium">Console Output:</p>
            <p>Check browser console for detailed test execution logs with timestamps, build IDs, and correlation IDs.</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
