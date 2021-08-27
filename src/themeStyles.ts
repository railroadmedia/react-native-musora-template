import type { Theme } from './interfaces/theme.interfaces';

export const LIGHT = 'LIGHT';
export const DARK = 'DARK';
export const OTHER = 'OTHER';

export const themeStyles: Theme = {
  [LIGHT]: {
    background: 'white',
    textColor: 'black',
    headerNavColor: 'black',
    contrastBackground: 'grey',
    contrastTextColor: 'grey',
    borderColor: 'lightgrey',
    textBoxColor: '#E1E6EB'
  },
  [DARK]: {
    background: '#00101D',
    textColor: 'white',
    headerNavColor: 'white',
    contrastBackground: '#081825',
    contrastTextColor: '#445F74',
    borderColor: '#002039',
    textBoxColor: '#F7F9FC'
  },
  [OTHER]: {}
};
