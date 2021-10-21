import { Dimensions, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import RNFetchBlob from 'rn-fetch-blob';
import * as svgs from './images/svgs';

interface UtilsInterface {
  rootUrl: string;
  brand: string;
  color: string;
  WIDTH: number;
  HEIGHT: number;
  getColorWithAlpha: (alpha: number) => string;
  isiOS: boolean;
  isTablet: boolean;
  fallbackAvatar: string;
  offPath: string;
  serverDownError: {
    title: string;
    message: string;
  };
  figmaFontSizeScaler: (fontSize: number) => number;
  svgBrand: ({
    icon: { width, height, fill }
  }: {
    icon: { width: string | number; height: string | number; fill: string };
  }) => JSX.Element;
}
class Utils implements UtilsInterface {
  brand = '';
  rootUrl = '';
  isiOS = Platform.OS === 'ios';
  isTablet = DeviceInfo.isTablet();
  navigationAnimationSpeed = 250;
  fallbackAvatar =
    'https://www.drumeo.com/laravel/public/assets/images/default-avatars/default-male-profile-thumbnail.png';
  fallbackThumb =
    'https://dmmior4id2ysr.cloudfront.net/assets/images/drumeo_fallback_thumb.jpg';
  offPath = RNFetchBlob.fs.dirs.DocumentDir;
  private _color: {
    [brand: string]: 'rgba(11, 118, 219, 1)' | 'rgba(251, 27, 47, 1)';
  } = {
    drumeo: 'rgba(11, 118, 219, 1)',
    pianote: 'rgba(251, 27, 47, 1)'
  };
  get color() {
    return this._color[this.brand];
  }
  getColorWithAlpha(alpha: number) {
    return this._color[this.brand]?.replace('1)', `${alpha})`) || '';
  }

  get WIDTH() {
    return Dimensions.get('screen').width;
  }

  get HEIGHT() {
    return Dimensions.get('screen').height;
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

  get loginBrandMsg() {
    switch (this.brand) {
      case 'pianote':
        return 'The Ultimate Online Piano Lessons Experience';
      case 'quitareo':
        return 'The Ultimate Online Guitar Lessons Experience';
      case 'singeo':
        return 'The Ultimate Online Voice Lessons Experience';
      default:
        return 'The Ultimate Online Drum Lessons Experience';
    }
  }

  filterLabels() {
    switch (this.brand) {
      case 'pianote':
        return {
          teacherSectionTitle: 'CHOOSE YOUR PIANO TEACHER',
          level: [
            '',
            'A level 1 pianist is just beginning and might not yet have any skills yet. A level 1 pianist will learn how to navigate the keyboard, play a C scale, chords and begin to build dexterity and control in their hands.',
            'A level 2 pianist can play a C scale hands together, a chord progression in the key of C and understands basic rhythm.',
            'A level 3 pianist can read basic notation and is gaining confidence in playing hands together and reading simple notation on the grand staff.',
            'A level 4 pianist understands how to build and play both major and minor scales and the 1-5-6-4 chord progression. At level 4 you are beginning to play with dynamics and are becoming comfortable in moving your hands outside of “C position” as you play.',
            'A level 5 pianist can play chord inversions and the G major scale as well as apply their knowledge of chord progressions to this new key. They can read notations that include accidentals and eighth notes.',
            'A level 6 a pianist can play in the keys of F major and D minor and is using chord inversions while playing chord progressions.',
            'A level 7 pianist can play with dynamics and the sustain pedal ,in 4/4 and ¾ time and is able to read and play most of the notation found within Pianote.',
            'At level 8 a pianist understands the circle of 5th and is able to use it to help them play scales and songs in any key signature.',
            'A level 9 pianist should be comfortable with the basics of improvisation and use a variety of left hand patterns and right hand fills as they create their own music. They also understand how to build and play 7th chords.',
            'A level 10 pianist understands the 12 bar blues, the blues scale, and the 2-5-1 Jazz progression. By level 10 you can learn to play any song in our library and improvise in pop, blues or jazz styles.'
          ]
        };
      case 'quitareo':
        return {
          level: []
        };
      case 'singeo':
        return { level: [] };
      default:
        return {
          teacherSectionTitle: 'CHOOSE YOUR DRUM TEACHER',
          level: [
            '',
            'A Level 1 drummer should be able to hold the drumsticks and play a basic drum beat in time with music.',
            'A Level 2 drummer should be able to read basic note values, understand the drum notation key, play basic rock, punk, and metal beats, and play basic rudiments like the single stroke roll, double stroke roll, and single paradiddle.',
            'A Level 3 drummer should understand the motions of drumming, be able to play triplets, flams, and drags, create a basic roadmap for a song, and play styles like country and disco.',
            'A Level 4 drummer should be able to use Moeller technique at a basic level, understand dotted notation, play in 3/4, 6/8, and 12/8, play basic jazz and blues patterns, and demonstrate 4-limb independence.',
            'A Level 5 drummer should be able to apply basic groupings to the drum-set, play styles like funk, jazz, soul, reggae, and bossa nova, understand ties, dynamic markings, and other basic elements of chart reading, and be able to demonstrate basic 4-limb independence in a jazz and rock setting.',
            'A Level 6 drummer should understand odd time signatures like 5/4, 5/8, 7/4, and 7/8, be able to apply odd note groupings to the drum-set, play styles like hip-hop, R&B, cha-cha-cha, soca, and second line, and understand the basics of comping and trading solos.',
            'A Level 7 drummer should be able to demonstrate 4-limb independence in styles like jazz, rock, and metal at an intermediate level, demonstrate hand-to-foot combinations, understand and demonstrate bass drum techniques like double bass playing, heel-toe, and slide technique.',
            'A Level 8 drummer should be able to navigate charts and lead sheets, play brushes at a basic level, play styles like samba and mozambique, and understand independence concepts like interpreting rhythms and interpreting stickings.',
            'A Level 9 drummer should be able to play all 40 drum rudiments, play Afro-Cuban styles like mambo, nanigo, and songo, solo over a musical vamp, and demonstrate 4-limb independence in Afro-Cuban, Afro-Brazilian, and swing styles.',
            'A Level 10 drummer should understand advanced rhythmic concepts including polyrhythms, polymeters, metric modulation, and odd note subdivisions, play advanced Afro-Cuban and jazz styles, play drum solos in a variety of different settings and styles, and demonstrate 4-limb independence at an advanced level.'
          ]
        };
    }
  }

  figmaFontSizeScaler(fontSize: number) {
    return fontSize * 1.2;
  }

  get launchScreens() {
    [];
    switch (this.brand) {
      case 'pianote':
        return [
          {
            jpg: require('./images/launchP1.jpg'),
            png: require('./images/launchP1.png'),
            bold: 'Pianote Lessons, Songs & Support',
            normal: 'Everywhere you go.'
          },
          {
            jpg: require('./images/launchP2.jpg'),
            png: require('./images/launchP2.png'),
            bold: ' Always Know Exactly What To Practice.',
            normal: `Unlike "video game" learning where you only learn what keys to hit, you'll actually play music with step-by-step lessons that will build your piano playing foundations!`
          },
          {
            jpg: require('./images/launchP3.jpg'),
            png: require('./images/launchP3.png'),
            bold: 'Play Your Favorite Songs',
            normal: `Nothing is better than playing to real music! So you'll get custom play-alongs to help you apply specific-skills PLUS breakdowns of popular music so you can play your favorite tunes!`
          },
          {
            jpg: require('./images/launchP4.jpg'),
            png: require('./images/launchP4.png'),
            bold: 'Personalized Lessons & Support',
            normal: `Get direct access to real teachers any time you have a question, access weekly live-streaming video lessons, and connect with teachers and students in the community forums!`
          },
          {
            bold: 'Not A Member?',
            normal: `Try it for free for 7-days when you click the sign up button below to set up your Pianote account.`
          }
        ];
      // case 'guitareo':
      //   return [
      //     {
      //       jpg: require('./images/launchG1.jpg'),
      //       png: require('./images/launchG1.png'),
      //       bold: 'Not A Member?',
      //       normal:
      //         'Try it for free for 7-days when you click the sign up button below to set up your Drumeo Edge account.'
      //     },
      //     {
      //       jpg: require('./images/launchG2.jpg'),
      //       png: require('./images/launchG2.png'),
      //       bold: 'Not A Member?',
      //       normal:
      //         'Try it for free for 7-days when you click the sign up button below to set up your Drumeo Edge account.'
      //     },
      //     {
      //       jpg: require('./images/launchG3.jpg'),
      //       png: require('./images/launchG3.png'),
      //       bold: 'Not A Member?',
      //       normal:
      //         'Try it for free for 7-days when you click the sign up button below to set up your Drumeo Edge account.'
      //     },
      //     {
      //       jpg: require('./images/launchG4.jpg'),
      //       png: require('./images/launchG4.png'),
      //       bold: 'Not A Member?',
      //       normal:
      //         'Try it for free for 7-days when you click the sign up button below to set up your Drumeo Edge account.'
      //     },
      //     {
      //       bold: 'Not A Member?',
      //       normal:
      //         'Try it for free for 7-days when you click the sign up button below to set up your Drumeo Edge account.'
      //     }
      //   ];
      // case 'singeo':
      //   return [
      //     {
      //       jpg: require('./images/launchS1.jpg'),
      //       png: require('./images/launchS1.png'),
      //       bold: 'Not A Member?',
      //       normal:
      //         'Try it for free for 7-days when you click the sign up button below to set up your Drumeo Edge account.'
      //     },
      //     {
      //       jpg: require('./images/launchS2.jpg'),
      //       png: require('./images/launchS2.png'),
      //       bold: 'Not A Member?',
      //       normal:
      //         'Try it for free for 7-days when you click the sign up button below to set up your Drumeo Edge account.'
      //     },
      //     {
      //       jpg: require('./images/launchS3.jpg'),
      //       png: require('./images/launchS3.png'),
      //       bold: 'Not A Member?',
      //       normal:
      //         'Try it for free for 7-days when you click the sign up button below to set up your Drumeo Edge account.'
      //     },
      //     {
      //       jpg: require('./images/launchS4.jpg'),
      //       png: require('./images/launchS4.png'),
      //       bold: 'Not A Member?',
      //       normal:
      //         'Try it for free for 7-days when you click the sign up button below to set up your Drumeo Edge account.'
      //     },
      //     {
      //       bold: 'Not A Member?',
      //       normal:
      //         'Try it for free for 7-days when you click the sign up button below to set up your Drumeo Edge account.'
      //     }
      //   ];
      default:
        return [
          {
            jpg: require('./images/launchD1.jpg'),
            png: require('./images/launchD1.png'),
            bold: 'Drum Lessons, Songs & Shows',
            normal: 'Everywhere you go.'
          },
          {
            jpg: require('./images/launchD2.jpg'),
            png: require('./images/launchD2.png'),
            bold: 'Learn From The Legends',
            normal: `Improve your drumming with step-by-step video courses featuring the best drummers in the world.`
          },
          {
            jpg: require('./images/launchD3.jpg'),
            png: require('./images/launchD3.png'),
            bold: 'Play Your Favorite Songs',
            normal: `Apply your skills to real music with detailed song breakdowns for the tunes you know and love.`
          },
          {
            jpg: require('./images/launchD4.jpg'),
            png: require('./images/launchD4.png'),
            bold: 'TV For Drummers',
            normal: `Drumming isn’t limited to the practice room. Enjoy exclusive documentaries and shows for drummers.`
          },
          {
            bold: 'Not A Member?',
            normal: `Try it for free for 7-days when you click the sign up button below to set up your Drumeo Edge account.`
          }
        ];
    }
  }

  get signUpPlanBenefits() {
    switch (this.brand) {
      case 'pianote':
        return [
          'Pay nothing for 7 days.',
          'Award-winning piano lessons & more.',
          'Access to the Pianote Experience app.',
          'Access to the Pianote Experience website.',
          'Cancel anytime through the App Store.'
        ];
      case 'guitareo':
        return [
          'Pay nothing for 7 days.',
          'Award-winning piano lessons & more.',
          'Access to the Pianote Experience app.',
          'Access to the Pianote Experience website.',
          'Cancel anytime through the App Store.'
        ];
      case 'singeo':
        return [
          'Pay nothing for 7 days.',
          'Award-winning piano lessons & more.',
          'Access to the Pianote Experience app.',
          'Access to the Pianote Experience website.',
          'Cancel anytime through the App Store.'
        ];
      default:
        return [
          'Pay nothing for 7 days.',
          'Award-winning drum lessons & more.',
          'Access the Drumeo Edge app.',
          'Access the Drumeo Edge website.',
          'Cancel anytime through App Store.'
        ];
    }
  }

  get subscriptionsSkus() {
    switch (this.brand) {
      case 'pianote':
        return this.isiOS
          ? [
              'pianote_app_1_month_membership_2021',
              'pianote_app_1_year_membership_2021'
            ]
          : ['pianote_app_1_year_2021', 'pianote_app_1_month_2021'];
      case 'guitareo':
        return this.isiOS
          ? ['drumeo_app_1_month_2021', 'drumeo_app_1_year_2021']
          : ['drumeo_app_1_month_2021', 'drumeo_app_1_year_2021'];
      case 'singeo':
        return this.isiOS
          ? ['drumeo_app_1_month_2021', 'drumeo_app_1_year_2021']
          : ['drumeo_app_1_month_2021', 'drumeo_app_1_year_2021'];
      default:
        return this.isiOS
          ? ['drumeo_app_1_month_2021', 'drumeo_app_1_year_2021']
          : ['drumeo_app_1_month_2021', 'drumeo_app_1_year_2021'];
    }
  }

  get expirationMsg() {
    switch (this.brand) {
      case 'pianote':
        return 'Your account no longer has access to Pianote. Click the button below to renew your membership — or, if you believe this is an error, please contact support@pianote.com.';
      case 'guitareo':
        return 'Your account no longer has access to Guitareo. Click the button below to renew your membership — or, if you believe this is an error, please contact support@guitareo.com.';
      case 'singeo':
        return 'Your account no longer has access to Singeo. Click the button below to renew your membership — or, if you believe this is an error, please contact support@singeo.com.';
      default:
        return 'Your account no longer has access to Drumeo Edge. Click the button below to renew your membership — or, if you believe this is an error, please contact support@drumeo.com.';
    }
  }
}

export let utils = new Utils();
