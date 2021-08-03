import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import * as svgs from './images/svgs';

interface UtilsInterface {
  rootUrl: string;
  brand: string;
  color: string;
  getColorWithAlpha: (alpha: number) => string;
  isiOS: boolean;
  isTablet: boolean;
  fallbackAvatar: string;
  serverDownError: {
    title: string;
    message: string;
  };
  figmaFontSizeScaler: (fontSize: number) => number;
  svgBrand: ({ icon: { width, height, fill } }: svgs.Props) => JSX.Element;
}
class Utils implements UtilsInterface {
  brand = '';
  rootUrl = '';
  isiOS = Platform.OS === 'ios';
  fallbackAvatar =
    'https://www.drumeo.com/laravel/public/assets/images/default-avatars/default-male-profile-thumbnail.png';

  private _color: {
    [brand: string]: 'rgba(11, 118, 219, 1)' | 'rgba(251, 27, 47, 1)';
  } = {
    drumeo: 'rgba(11, 118, 219, 1)',
    pianote: 'rgba(251, 27, 47, 1)'
  };
  get color() {
    return this._color[this.brand];
  }
  get isTablet() {
    return DeviceInfo.isTablet();
  }
  getColorWithAlpha(alpha: number) {
    return this._color[this.brand]?.replace('1)', `${alpha})`) || '';
  }

  private serverDownMsg =
    'is down. We are working on a fix and it should be back shortly. Thank you for your patience.';
  private _serverDown: { [brand: string]: { title: string; message: string } } =
    {
      drumeo: {
        title: 'Oh no, we dropped a stick...',
        message: `Drumeo ${this.serverDownMsg}`
      },
      pianote: {
        title: 'Something went wrong...',
        message: `Pianote ${this.serverDownMsg}`
      }
    };
  get serverDownError() {
    return this._serverDown[this.brand];
  }

  get svgBrand() {
    switch (this.brand) {
      case 'pianote':
        return svgs.pianote;
      case 'quitareo':
        return svgs.guitareo;
      case 'singeo':
        return svgs.singeo;
      default:
        return svgs.drumeo;
    }
  }

  figmaFontSizeScaler(fontSize: number) {
    return fontSize * 1.2;
  }
}

export let utils = new Utils();
