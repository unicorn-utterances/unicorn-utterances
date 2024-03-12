export function translatePigLatin(strr) {
  // Code originally migrated from: 
  // https://www.freecodecamp.org/forum/t/freecodecamp-algorithm-challenge-guide-pig-latin/16039/7
  if (!strr) return '';
  return strr.split(' ').map(str => {
    if (["a", "e", "i", "o", "u"].indexOf(str.charAt(0)) != -1) {
      return str += "way";
    }
    return str.replace(/([^aeiou]*)([aeiou]\w*)/, "$2$1ay");
  }).join(' ');
}
