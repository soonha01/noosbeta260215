import Stepper, { Step } from '../../Stepper';

const textInputStyle = {
  width: '100%',
  padding: '10px',
  margin: '10px 0',
  borderRadius: '5px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  background: 'rgba(255, 255, 255, 0.06)',
  color: '#fff',
};

const compactTextInputStyle = {
  ...textInputStyle,
  margin: '5px 0',
};

export const SignupStepperStage = ({
  StepperWrapperComponent,
  activeStep,
  name,
  email,
  password,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onStepChange,
  onFinalStepCompleted,
}) => {
  const StepperWrapper = StepperWrapperComponent;

  return (
    <StepperWrapper>
      <Stepper
        initialStep={1}
        onFinalStepCompleted={onFinalStepCompleted}
        backButtonText="Previous"
        nextButtonText="Next"
        onStepChange={onStepChange}
        disableStepIndicators={true}
        nextButtonProps={{
          disabled:
            (activeStep === 2 && !name.trim()) ||
            (activeStep === 3 && (!email.trim() || !password.trim())),
        }}
      >
        <Step>
          <h2>Welcome to Sign Up!</h2>
          <p>Let&apos;s get you started with your account!</p>
        </Step>
        <Step>
          <h2>Personal Information</h2>
          <input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Your full name"
            style={textInputStyle}
          />
        </Step>
        <Step>
          <h2>Account Details</h2>
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="Email address"
            style={compactTextInputStyle}
          />
          <input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Password"
            style={compactTextInputStyle}
          />
        </Step>
        <Step>
          <h2>Welcome Aboard!</h2>
          <p>Your account has been created successfully!</p>
        </Step>
      </Stepper>
    </StepperWrapper>
  );
};
