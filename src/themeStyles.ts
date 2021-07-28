export const LIGHT = 'LIGHT';
export const DARK = 'DARK';
export const OTHER = 'OTHER';

interface Themes {
  [theme: string]: {
    background?: string;
    textColor?: string;
    iconColor?: string;
    headerNavColor?: string;
    contrastBackground?: string;
    contrastTextColor?: string;
  };
}
export const themeStyles: Themes = {
  [LIGHT]: {
    background: 'white',
    textColor: 'black',
    headerNavColor: 'black',
    contrastBackground: 'grey',
    contrastTextColor: 'darkgrey'
  },
  [DARK]: {
    background: '#00101D',
    textColor: 'white',
    headerNavColor: 'white',
    contrastBackground: '#081825',
    contrastTextColor: '#445F74'
  },
  [OTHER]: {}
};
