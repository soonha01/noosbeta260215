import { describe, expect, it } from 'vitest';
import * as styles from './LoginController.styles';

const expectedStyleExports = [
  'BackButtonWrapper',
  'DeviceFloatingActions',
  'DeviceFloatingButton',
  'LoginContainer',
  'StepperWrapper',
  'StyledWrapper',
];

describe('LoginController styles contract', () => {
  it('exports the styled components used by the login controller and stage views', () => {
    expect(Object.keys(styles).sort()).toEqual(expectedStyleExports.sort());

    expectedStyleExports.forEach((exportName) => {
      expect(styles[exportName]).toBeTruthy();
    });
  });
});
