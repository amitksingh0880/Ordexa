export class InvalidOrderTransitionError extends Error {
  constructor(from: string, event: string) {
    super(`❌ Invalid transition from "${from}" using event "${event}"`);
    this.name = 'InvalidOrderTransitionError';
  }
}
