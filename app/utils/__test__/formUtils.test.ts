import {
  badRequest,
  generateRandomString,
  haveErrors,
  validateEmail,
  validateLyrics,
  validatePassword,
  validateThought,
} from '../formUtils';

describe('generateRandomString', () => {
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

describe('haveErrors', () => {
  it('returns true if there is error in fields', () => {
    const fieldErrors = {
      username: null,
      email: '',
      password: 'password should be 6 characters long',
    };
    expect(haveErrors(fieldErrors)).toBe(true);
  });

  it('returns false if there is no error message', () => {
    const fieldErrors = {
      username: undefined,
      email: undefined,
      password: undefined,
    };
    expect(haveErrors(fieldErrors)).toBe(false);
  });
});

describe('badRequest', () => {
  it('returns a response with the right message', async () => {
    const jsonResponse = badRequest({ message: 'A request made with wrong data' });
    const json = await jsonResponse.json();
    expect(json.message).toBe('A request made with wrong data');
  });
});

describe('input validation', () => {
  describe('validate thought', () => {
    it('returns error message on string less than 20', () => {
      expect(validateThought('some random thought')).toEqual(
        'Less than 20 characters. Your thought should be more descriptive so people can understand better',
      );
      expect(
        validateThought('some random thought that is definitely longer than 20 characters'),
      ).toBeUndefined();
    });
  });
  describe('validate email', () => {
    const validEmails = [
      'email@example.com',
      'firstname.lastname@example.com',
      'email@subdomain.example.com',
      'firstname+lastname@example.com',
      'email@[123.123.123.123]',
      "email'@example.com",
      '1234567890@example.com',
      'email@example-one.com',
      '_______@example.com',
    ];
    it.each(validEmails)('%s should be a valid email', email => {
      expect(validateEmail(email)).toBe(undefined);
    });
  });
  describe('validate lyrics', () => {
    it('returns an error message when lyrics is between 0 & 10', () => {
      const lyrics = 'middle';
      expect(validateLyrics(lyrics)).toBe(
        'Less than 10 characters. The lyrics should be more than 10 characters or empty',
      );
      expect(validateLyrics('')).toBe(undefined);
      expect(validateLyrics('some long lyrics')).toBe(undefined);
    });
  });

  describe('validate password', () => {
    it('returns error message if password length is less than 6', () => {
      const password = '12345';
      expect(validatePassword(password)).toBe('Password should be at least 6 characters long');
    });

    it("returns error message if password doesn't contains a digit", () => {
      const password = 'AverysTrongpasswordthatfails';
      expect(validatePassword(password)).toBe('Password should contain at least 1 number');
    });

    it('returns undefined if password is valid', () => {
      const password = 'p4sswoRdthatPASS';
      expect(validatePassword(password)).toBeUndefined();
    });
  });
});
