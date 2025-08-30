export type SagaStep = {
  name: string;

  action: () => Promise<void>;
  compensation?: () => Promise<void>;

  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
};
