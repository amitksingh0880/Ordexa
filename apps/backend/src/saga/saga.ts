import type { SagaStep } from "./types";

export class Saga {
  private executedSteps: SagaStep[] = [];

  constructor(private steps: SagaStep[]) {}

  public async execute() {
    for (const step of this.steps) {
      try {
        await step.action();
        this.executedSteps.push(step);
      } catch (err) {
        console.error(`❌ Step failed: ${step.name}. Starting compensation...`);
        await this.compensate();
        throw err;
      }
    }
  }

  private async compensate() {
    for (const step of this.executedSteps.reverse()) {
      if (step.compensation) {
        try {
          await step.compensation();
          console.log(`↩️ Compensation succeeded for: ${step.name}`);
        } catch (err) {
          console.error(`⚠️ Compensation failed for: ${step.name}`, err);
        }
      }
    }
  }
}
