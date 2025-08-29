export default {
  components: {
    AudioRecorder: {
      labels: {
        error: 'Error',
        hint: 'Hold down to record',
        recording: 'Recording...',
      },
    },
    ThemeButton: {
      labels: {
        switchTheme: 'Switch Theme',
      },
    },
  },
  layouts: {
    drawers: {
      LeftMainDrawer: {
        labels: {
          home: 'Home',
        },
      },
    },
    headers: {
      MainHeader: {
        labels: {
          title: 'Le Bot',
        },
      },
    },
  },
  pages: {
    HomePage: {
      labels: {
        userId: 'User ID',
        connect: 'Connect',
        disconnect: 'Disconnect',
        processing: 'Processing...',
        noUnfinishedMessage: 'No unfinished message',
      },
    },
    SignInOrSignUpPage: {
      labels: {
        title: 'Le Bot',
        description: 'Your intelligent pet and good companion',
        phoneOrEmail: 'Phone Number / Email',
        code: 'Verification Code',
        sendCode: 'Send Code',
        password: 'Password',
        signIn: 'Sign In',
        signInOrSignUp: 'Sign In / Sign Up',
        useCode: 'Use Code',
        usePassword: 'Use Password',
      },
      errors: {
        invalidPhoneOrEmail: 'Invalid phone number or email',
      },
    },
  },
};
