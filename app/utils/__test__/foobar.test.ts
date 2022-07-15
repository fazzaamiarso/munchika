import { generateRandomString } from '../formUtils';

describe('happy path vitest', () => {
  it('works', () => {
    const randomString = generateRandomString();
    expect(randomString).toHaveLength(8);
  });
});
