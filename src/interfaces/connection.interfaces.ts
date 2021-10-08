export interface ConnectionContext {
  isConnected: boolean;
  setIsConnected: (isConnected: boolean) => void;
  showNoConnectionAlert: () => void;
}
