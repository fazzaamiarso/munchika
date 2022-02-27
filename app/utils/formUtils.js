export const validateThought = thought => {
  if (thought.length < 20)
    return 'Less than 20 characters. Your thought should be more descriptive so people can understand better';
};
export const validateLyrics = lyrics => {
  if (lyrics.length < 10 && lyrics.length > 0)
    return 'Less than 10 characters. The lyrics should be more than 10 characters or empty';
};
