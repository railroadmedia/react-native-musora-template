import type { OrientationType } from 'react-native-orientation-locker';

export interface OrientationContext {
  orientation: OrientationType;
  isLandscape: boolean;
  updateOrientation: (orientation: OrientationType) => void;
}
