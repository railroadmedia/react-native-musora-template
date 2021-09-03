import React from 'react';
import { BackHeader } from './BackHeader';
import { MainHeader } from './MainHeader';

interface Props {
  title?: string;
  transparent?: boolean;
  settingsVisible?: boolean;
}
export const Header: React.FC<Props> = ({
  title,
  transparent,
  settingsVisible
}) => {
  return title ? (
    <BackHeader
      title={title}
      transparent={transparent}
      settingsVisible={settingsVisible}
    />
  ) : (
    <MainHeader />
  );
};
