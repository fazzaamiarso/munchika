import { createQueryString } from '../url';

describe('url utils', () => {
  it('create a new query string from record', () => {
    const queryRecord = {
      query: 'charlie puth',
      limit: '10',
      category: 'tracks',
    };
    const queryString = createQueryString(queryRecord);
    expect(queryString).toBe('query=charlie+puth&limit=10&category=tracks');
  });
});
