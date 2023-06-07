import { Alert } from '../alert';

test('Creating new instance', () => {
  expect(new Alert()).toBeInstanceOf(Alert);
});
