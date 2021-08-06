import { createContext } from 'react';
import { OrientationType } from 'react-native-orientation-locker';

export interface IOrientationContext {
  orientation: OrientationType;
  isLandscape: boolean;
  updateOrientation: (orientation: OrientationType) => void;
}

export const OrientationContext = createContext<IOrientationContext>({
  orientation: OrientationType.PORTRAIT,
  isLandscape: false,
  updateOrientation: () => {}
});
