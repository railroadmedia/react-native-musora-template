import type { OrientationType } from 'react-native-orientation-locker';

export interface IOrientationContext {
  orientation: OrientationType;
  isLandscape: boolean;
  updateOrientation: (orientation: OrientationType) => void;
}
