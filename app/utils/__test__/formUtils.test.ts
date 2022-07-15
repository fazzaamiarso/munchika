import { generateRandomString } from '../formUtils';

describe('form utils', () => {
  it('it generated an 8 length string', () => {
    for (let i = 0; i <= 2; i++) {
      const randomString = generateRandomString();
      expect(randomString).toHaveLength(8);
    }
  });
  it('generated different strings', () => {
    const string1 = generateRandomString();
    const string2 = generateRandomString();
    expect(Object.is(string1, string2)).toBe(false);
  });
});
