import styled from 'styled-components';
import { loginAnalysisStyles } from './LoginController.analysis.styles';
import { loginStyleAnimations } from './LoginController.animations.styles';
import { loginFlowStyles } from './LoginController.flow.styles';
import { loginFormStyles } from './LoginController.form.styles';
import { loginOptionStyles } from './LoginController.option.styles';
import { loginResponsiveStyles } from './LoginController.responsive.styles';

export const StyledWrapper = styled.div`

  width: clamp(520px, 34vw, 760px);
  max-width: calc(100vw - 64px);

  ${loginStyleAnimations}
  ${loginFormStyles}
  ${loginFlowStyles}
  ${loginAnalysisStyles}
  ${loginOptionStyles}
  ${loginResponsiveStyles}
`;
