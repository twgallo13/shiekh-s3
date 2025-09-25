/**
 * Acceptance Test Runner - Development Only
 * In-browser test runner for acceptance scenarios mapping to §17 specification
 * Only enabled when NODE_ENV === "development"
 */

export interface TestScenario {
  id: string;
  title: string;
  run: () => Promise<void>;
}

export interface TestResult {
  scenarioId: string;
  status: 'PENDING' | 'PASS' | 'FAIL';
  timestamp: number;
  buildId: string;
  correlationId: string;
  error?: string;
  duration?: number;
}

export interface TestRunner {
  runAll: () => Promise<TestResult[]>;
  runScenario: (scenarioId: string) => Promise<TestResult>;
  getResults: () => TestResult[];
  hasFailures: () => boolean;
  getBlockReleaseFlag: () => boolean;
}

class AcceptanceTestRunner implements TestRunner {
  private scenarios: TestScenario[] = [];
  private results: TestResult[] = [];
  private buildId: string;
  private blockRelease: boolean = false;

  constructor() {
    // Only initialize in development
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    
    this.buildId = this.generateBuildId();
    this.loadScenarios();
  }

  private generateBuildId(): string {
    return `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadScenarios(): void {
    // Dynamically import scenarios (will be implemented in scenarios.sample.ts)
    try {
      // This would normally import from scenarios.sample.ts
      // For now, we'll create a placeholder
      this.scenarios = [];
    } catch (error) {
      console.warn('Failed to load acceptance test scenarios:', error);
    }
  }

  async runAll(): Promise<TestResult[]> {
    if (process.env.NODE_ENV !== "development") {
      console.warn('Acceptance tests are only available in development mode');
      return [];
    }

    console.log(`🧪 Starting acceptance test run: ${this.buildId}`);
    this.results = [];
    this.blockRelease = false;

    for (const scenario of this.scenarios) {
      const result = await this.runScenario(scenario.id);
      this.results.push(result);
      
      if (result.status === 'FAIL') {
        this.blockRelease = true;
      }
    }

    this.logResults();
    return this.results;
  }

  async runScenario(scenarioId: string): Promise<TestResult> {
    if (process.env.NODE_ENV !== "development") {
      return {
        scenarioId,
        status: 'FAIL',
        timestamp: Date.now(),
        buildId: this.buildId,
        correlationId: this.generateCorrelationId(),
        error: 'Tests only available in development'
      };
    }

    const scenario = this.scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      const result: TestResult = {
        scenarioId,
        status: 'FAIL',
        timestamp: Date.now(),
        buildId: this.buildId,
        correlationId: this.generateCorrelationId(),
        error: `Scenario ${scenarioId} not found`
      };
      this.logResult(result);
      return result;
    }

    const correlationId = this.generateCorrelationId();
    const startTime = Date.now();

    try {
      console.log(`🧪 Running scenario: ${scenario.title} (${scenarioId})`);
      await scenario.run();
      
      const duration = Date.now() - startTime;
      const result: TestResult = {
        scenarioId,
        status: 'PASS',
        timestamp: Date.now(),
        buildId: this.buildId,
        correlationId,
        duration
      };
      
      this.logResult(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        scenarioId,
        status: 'FAIL',
        timestamp: Date.now(),
        buildId: this.buildId,
        correlationId,
        error: error instanceof Error ? error.message : String(error),
        duration
      };
      
      this.logResult(result);
      return result;
    }
  }

  getResults(): TestResult[] {
    return [...this.results];
  }

  hasFailures(): boolean {
    return this.results.some(result => result.status === 'FAIL');
  }

  getBlockReleaseFlag(): boolean {
    return this.blockRelease;
  }

  private logResult(result: TestResult): void {
    const logEntry = {
      timestamp: new Date(result.timestamp).toISOString(),
      buildId: result.buildId,
      correlationId: result.correlationId,
      scenarioId: result.scenarioId,
      status: result.status,
      duration: result.duration,
      error: result.error
    };

    if (result.status === 'PASS') {
      console.log(`✅ ${result.scenarioId}: PASS`, logEntry);
    } else {
      console.error(`❌ ${result.scenarioId}: FAIL`, logEntry);
    }
  }

  private logResults(): void {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;

    console.log(`🧪 Acceptance Test Summary:`, {
      buildId: this.buildId,
      total,
      passed,
      failed,
      blockRelease: this.blockRelease
    });

    if (this.blockRelease) {
      console.warn('🚫 BLOCK RELEASE: One or more acceptance tests failed');
    } else {
      console.log('✅ RELEASE READY: All acceptance tests passed');
    }
  }

  // Method to register scenarios (called by scenarios.sample.ts)
  registerScenarios(scenarios: TestScenario[]): void {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    this.scenarios = scenarios;
  }
}

// Singleton instance
let runnerInstance: AcceptanceTestRunner | null = null;

export function getAcceptanceTestRunner(): TestRunner {
  if (process.env.NODE_ENV !== "development") {
    // Return a no-op runner in production
    return {
      runAll: async () => [],
      runScenario: async () => ({
        scenarioId: '',
        status: 'FAIL',
        timestamp: Date.now(),
        buildId: '',
        correlationId: '',
        error: 'Tests only available in development'
      }),
      getResults: () => [],
      hasFailures: () => false,
      getBlockReleaseFlag: () => false
    };
  }

  if (!runnerInstance) {
    runnerInstance = new AcceptanceTestRunner();
  }
  return runnerInstance;
}

// Export for scenarios to register themselves
export function registerAcceptanceScenarios(scenarios: TestScenario[]): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  
  const runner = getAcceptanceTestRunner() as AcceptanceTestRunner;
  runner.registerScenarios(scenarios);
}
