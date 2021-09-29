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
