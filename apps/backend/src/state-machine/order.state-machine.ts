import { orderTransitions } from './order.transitions';
import { InvalidOrderTransitionError } from './errors';
import type { OrderEvent, OrderState } from './order.types';

export class OrderStateMachine {
  private currentState: OrderState;

  constructor(initialState: OrderState) {
    this.currentState = initialState;
  }

  public transition(event: OrderEvent): OrderState {
    const match = orderTransitions.find(
      (t) => t.from === this.currentState && t.event === event
    );

    if (!match) {
      throw new InvalidOrderTransitionError(this.currentState, event);
    }

    this.currentState = match.to;
    return this.currentState;
  }

  public canTransition(event: OrderEvent): boolean {
    return orderTransitions.some(
      (t) => t.from === this.currentState && t.event === event
    );
  }

  public getState(): OrderState {
    return this.currentState;
  }
}
