export const validateThought = thought => {
  if (thought.length < 20)
    return 'Less than 20 characters. Your thought should be more descriptive so people can understand better';
};
export const validateLyrics = lyrics => {
  if (lyrics.length < 10 && lyrics.length > 0)
    return 'Less than 10 characters. The lyrics should be more than 10 characters or empty';
};
export const validatePassword = password => {
  if (password.length < 6)
    return 'Password should be at least 6 characters long';
  if (!/\d/i.test(password)) return 'Password should contain at least a number';
};
export const validateEmail = email => {
  const regexp =
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!regexp.test(email)) return 'Invalid email address';
};

export const haveErrors = fieldErrors => {
  return Object.values(fieldErrors).some(Boolean);
};
