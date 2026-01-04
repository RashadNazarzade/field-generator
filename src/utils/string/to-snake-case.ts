export const toSnakeCase = (str: string) => {
  if (!str) return '';

  let result = '';
  let prevWasLower = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i] as string;
    const isUpper = char >= 'A' && char <= 'Z';

    if(isUpper && prevWasLower && i > 0){
      result += '_';
    }

    result += char.toLowerCase();
    prevWasLower = !isUpper;
  }
   
    return result;
};
