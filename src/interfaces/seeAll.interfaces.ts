import type { Card } from './card.interfaces';

interface SeeAllState {
  content: number[];
  loadingMore: boolean;
  refreshing: boolean;
}
interface SeeAllAction {
  type: string;
  content?: Card[];
  loadingMore?: boolean;
  refreshing?: boolean;
}

export interface SeeAllReducer {
  (state: SeeAllState, action: SeeAllAction): SeeAllState;
}
