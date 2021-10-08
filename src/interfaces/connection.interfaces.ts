export interface ConnectionContext {
  isConnected: boolean | null;
  setIsConnected: (isConnected: boolean) => void;
  showNoConnectionAlert: () => void;
}
