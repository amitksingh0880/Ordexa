// import type { SagaStep } from "./types";

// export class Saga {
//   private executedSteps: SagaStep[] = [];

//   constructor(private steps: SagaStep[]) {}

//   public async execute() {
//     for (const step of this.steps) {
//       try {
//         await step.action();
//         this.executedSteps.push(step);
//       } catch (err) {
//         console.error(`❌ Step failed: ${step.name}. Starting compensation...`);
//         await this.compensate();
//         throw err;
//       }
//     }
//   }

//   private async compensate() {
//     for (const step of this.executedSteps.reverse()) {
//       if (step.compensation) {
//         try {
//           await step.compensation();
//           console.log(`↩️ Compensation succeeded for: ${step.name}`);
//         } catch (err) {
//           console.error(`⚠️ Compensation failed for: ${step.name}`, err);
//         }
//       }
//     }
//   }
// }


import type { SagaStep } from "./types";

export class Saga {
  private executedSteps: SagaStep[] = [];

  constructor(
    private steps: SagaStep[],
    private sagaName: string = "UnnamedSaga"
  ) {}

  public async execute(): Promise<void> {
    for (const step of this.steps) {
      const maxRetries = step.maxRetries ?? 3;
      const retryDelay = step.retryDelayMs ?? 500;
      const timeoutMs = step.timeoutMs ?? 10000;

      let attempt = 0;
      let success = false;

      while (!success && attempt < maxRetries) {
        try {
          console.log(`➡️ Step: ${step.name} (Attempt ${attempt + 1}/${maxRetries})`);
          await this.withTimeout(step.action, timeoutMs);
          this.executedSteps.push(step);
          success = true;
        } catch (err) {
          console.error(`❌ Step "${step.name}" failed on attempt ${attempt + 1}`, err);
          attempt++;

          if (attempt < maxRetries) {
            const delay = retryDelay * Math.pow(2, attempt - 1); // exponential backoff
            console.log(`⏳ Retrying "${step.name}" after ${delay}ms...`);
            await new Promise((res) => setTimeout(res, delay));
          }
        }
      }

      if (!success) {
        console.log(`🚨 Step "${step.name}" failed after ${maxRetries} attempts. Triggering compensation...`);
        await this.compensate();
        throw new Error(`Saga failed at step "${step.name}"`);
      }
    }

    console.log("✅ Saga completed successfully.");
  }

  private async compensate(): Promise<void> {
    for (const step of this.executedSteps.reverse()) {
      if (step.compensation) {
        try {
          console.log(`↩️ Compensating step: ${step.name}`);
          await step.compensation();
        } catch (err) {
          console.error(`⚠️ Compensation failed for step "${step.name}"`, err);
        }
      }
    }
  }

  private async withTimeout(fn: () => Promise<void>, timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("⏰ Step timed out")), timeoutMs);
      fn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }
}

