import React from 'react';
import { View } from 'react-native';
import { BackHeader } from './BackHeader';
import { MainHeader } from './MainHeader';

interface Props {
  onLogoPress: Function;
  onDownloadsPress: Function;
  onMyListPress: Function;
  onProfilePress: Function;
  onBack?: Function;
  title?: string;
  transparent?: boolean;
  onSettings?: Function;
  hidden?: boolean;
}
export const Header: React.FC<Props> = ({
  onBack,
  title,
  transparent,
  onSettings,
  onDownloadsPress,
  onLogoPress,
  onMyListPress,
  onProfilePress,
  hidden
}) => {
  return (
    <View style={{ height: hidden ? 0 : undefined, overflow: 'hidden' }}>
      {hidden ? (
        <></>
      ) : onBack ? (
        <BackHeader
          onBack={onBack}
          title={title || ''}
          transparent={transparent}
          onSettings={onSettings}
        />
      ) : (
        <MainHeader
          onDownloadsPress={onDownloadsPress}
          onLogoPress={onLogoPress}
          onMyListPress={onMyListPress}
          onProfilePress={onProfilePress}
        />
      )}
    </View>
  );
};
