export type SagaStep = {
  name: string;
  action: () => Promise<void>;
  compensation?: () => Promise<void>;
};
