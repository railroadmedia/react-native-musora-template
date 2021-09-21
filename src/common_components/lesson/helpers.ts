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
