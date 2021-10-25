import type {
  MusicSheet,
  Resource,
  ResourceWithExtension
} from '../../interfaces/lesson.interfaces';
import { Image } from 'react-native';

export const parseXpValue = function (xp: number): string {
  if (xp >= 100000 && xp < 1000000) {
    return Math.round(xp / 1000) + 'K';
  } else if (xp >= 1000000) {
    return Math.round(xp / 1000000).toFixed(1) + 'M';
  }

  return xp.toString();
};

export const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const getProgress = (user_progress: [{ progress_percent: number }]) => {
  try {
    return (
      parseInt(Object.values(user_progress)[0].progress_percent.toFixed()) || 0
    );
  } catch (e) {
    return 0;
  }
};

export const formatTime = (seconds: number) => {
  if (seconds < 1) return '0:00';
  let h: number = seconds / 3600;
  let m: number | string = (seconds - h * 3600) / 60;
  let s: number | string = seconds - m * 60 - h * 3600;

  s = s < 10 ? `0${s}` : `${s}`;
  m = m < 10 ? (h ? `0${m}` : `${m}`) : `${m}`;
  return h ? `${h}:${m}:${s}` : `${m}:${s}`;
};

export const decideExtension = (url: string): string => {
  const lastDot = url.lastIndexOf('.');
  const extension = url.substr(lastDot + 1).toLowerCase();

  return extension;
};

export const getExtensionByType = (path: string): string => {
  if (path === 'audio/mp3') return 'mp3';
  if (path === 'application/pdf') return 'pdf';
  if (path === 'application/zip') return 'zip';
  return '';
};

export const getSheetWHRatio = async (
  sheets: MusicSheet[]
): Promise<MusicSheet[]> => {
  let assignPromises = [];
  let svgs: MusicSheet[] = [];
  let nsvgs: MusicSheet[] = [];
  sheets.map(sheet => {
    if (sheet.value.includes('.pdf')) return;
    if (sheet.value.includes('.svg')) svgs.push({ ...sheet });
    else nsvgs.push({ ...sheet });
  });
  if (svgs.length) {
    let a: Promise<MusicSheet[]> = new Promise(async res => {
      let vbPromises: Promise<Response>[] = [];
      svgs.map(s => vbPromises.push(fetch(s.value)));
      (await Promise.all(vbPromises)).map(async (vbResp: any, i: number) => {
        let vbArr;
        try {
          vbArr = vbResp._bodyText
            .split('viewBox="')[1]
            .split('" ')[0]
            .split(' ');
        } catch (e) {
          vbArr = (await vbResp.text())
            .split('viewBox="')[1]
            .split('" ')[0]
            .split(' ');
        }
        svgs[i].whRatio = parseInt(vbArr[2]) / parseInt(vbArr[3]);
        if (i === svgs.length - 1) return res(svgs);
      });
    });
    assignPromises.push(a);
  }
  if (nsvgs.length) {
    nsvgs.map(ns => {
      let c: Promise<MusicSheet[]> = new Promise(res => {
        Image.getSize(
          ns.value,
          (w, h) => {
            ns.whRatio = w / h;
            res(nsvgs);
          },
          e => {
            ns.whRatio = 1;
            res(nsvgs);
          }
        );
      });
      assignPromises.push(c);
    });
  }

  return (await Promise.all(assignPromises)).flat();
};
