import React from 'react';

import { sort } from '../images/svgs';
import { utils } from '../utils';

interface Props {
  onPress: Function;
}
export const Sort: React.FC<Props> = ({ onPress }) => {
  return (
    <>
      {sort({
        icon: { width: 40, fill: utils.color },
        container: { paddingRight: 10 },
        onPress
      })}
    </>
  );
};
