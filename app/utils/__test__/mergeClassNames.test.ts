import { mergeClassNames } from '../mergeClassNames';

it('merges string args into a string', () => {
  const mergedString = mergeClassNames(
    'some',
    'random',
    Math.random() > 0.5 ? 'yeayy' : 'unfortunate',
  );
  expect(mergedString).toBeTypeOf('string');
});
