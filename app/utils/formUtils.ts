import { json } from '@remix-run/node';

export const validateThought = (thought: string) => {
  if (thought.length < 20)
    return 'Less than 20 characters. Your thought should be more descriptive so people can understand better';
};
export const validateLyrics = (lyrics: string) => {
  if (lyrics.length < 10 && lyrics.length > 0)
    return 'Less than 10 characters. The lyrics should be more than 10 characters or empty';
};
export const validatePassword = (password: string) => {
  if (password.length < 6) return 'Password should be at least 6 characters long';
  if (!/\d/i.test(password)) return 'Password should contain at least 1 number';
};
export const validateEmail = (email: string) => {
  const regexp = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!regexp.test(email)) return 'Invalid email address';
};

export const haveErrors = <T extends Record<string, unknown>>(fieldErrors: T) => {
  return Object.values(fieldErrors).some(Boolean);
};

export const badRequest = <T extends unknown>(data: T) => {
  return json(data, { status: 400 });
};

const getRandomNumberFromString = (string: string): string =>
  string[Math.floor(Math.random() * string.length)];
export const generateRandomString = () => {
  const ALPHABET = 'abcdefghijklmnovqrstuvwxyz';
  const NUMBER = '1234567890';
  let generated = [];
  for (let i = 0; i < 8; i++) {
    if (Math.random() > 0.5) {
      generated.push(getRandomNumberFromString(ALPHABET));
      continue;
    }
    generated.push(getRandomNumberFromString(NUMBER));
  }
  return generated.join('');
};
