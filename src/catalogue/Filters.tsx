import React from 'react';
import { filters } from '../images/svgs';
import { utils } from '../utils';

interface Props {
  onPress: Function;
}
export const Filters: React.FC<Props> = ({ onPress }) => {
  return <>{filters({ icon: { width: 40, fill: utils.color }, onPress })}</>;
};
