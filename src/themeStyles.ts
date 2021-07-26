export const LIGHT = 'LIGHT';
export const DARK = 'DARK';
export const OTHER = 'OTHER';

interface Themes {
  [theme: string]: {
    background?: string;
    textColor?: string;
    iconColor?: string;
    headerNavColor?: string;
  };
}
export const themeStyles: Themes = {
  [LIGHT]: {
    background: 'white',
    textColor: 'black',
    iconColor: 'black',
    headerNavColor: 'black'
  },
  [DARK]: {
    background: '#00101D',
    textColor: 'white',
    iconColor: '#445F74',
    headerNavColor: 'white'
  },
  [OTHER]: {}
};
