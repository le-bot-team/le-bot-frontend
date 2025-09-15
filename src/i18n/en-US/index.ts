export default {
  components: {
    auth: {
      NewPasswordPanel: {
        labels: {
          welcome:
            'Welcome back, {username}!\n' +
            'We notice that you currently have no password.\n' +
            'Please set a password for better experience.',
          welcomeNew: 'Welcome, {username}!\n' + 'Please set your password to continue.',
          newPassword: 'New Password',
          confirmNewPassword: 'Confirm New Password',
        },
        notifications: {
          invalidCode: 'Invalid verification code',
          invalidEmailOrPhone: 'Invalid email or phone number',
          invalidType: 'Invalid type',
          passwordTooShort: 'Password too short',
          passwordResetSuccess: 'Password reset successfully',
          loginSuccess: 'Login successfully',
          unknownError: 'Unknown error',
        },
      },
      SetupProfilePanel: {
        labels: {
          welcome:
            'Welcome, {username}!\n' +
            'Please set up your profile to continue.\n' +
            'Or you can skip this step and change it in settings later.',
          avatar: 'Avatar',
          uploadAvatar: 'Upload\nAvatar',
          nickname: 'Nickname',
          bio: 'Bio',
          confirm: 'Confirm',
        },
        notifications: {
          unknownError: 'Unknown error',
        },
      },
      SignInOrSignUpPanel: {
        labels: {
          phoneOrEmail: 'Phone Number / Email',
          code: 'Verification Code',
          password: 'Password',
          sendCode: 'Send Code',
          resendCode: 'Resend Code',
          resendCodeCoolDown: 'Resend Code ({seconds}s)',
          signInOrSignUp: 'Sign In / Sign Up',
          signIn: 'Sign In',
          usePassword: 'Use Password',
          useCode: 'Use Code',
        },
        errors: {
          invalidCode: 'Invalid verification code',
          invalidPhoneOrEmail: 'Invalid phone number or email',
        },
        notifications: {
          codeSent: 'Verification code sent',
          unknownError: 'Unknown error',
        },
      },
      FinishPanel: {
        labels: {
          welcome: 'Welcome back, {username}!\n' + 'You have successfully signed in.',
          welcomeNew: 'Welcome, {username}!\n' + 'Your account has been created successfully.',
          redirect: 'Taking you back to the previous page...',
        },
      },
    },
    me: {
      ProfileCard: {
        labels: {
          signInOrSignUp: 'Sign In / Sign Up',
        }
      }
    },
    AudioRecorder: {
      labels: {
        error: 'Error',
        hint: 'Hold down to record',
        recording: 'Recording...',
      },
    },
    CropperDialog: {
      labels: {
        title: 'Crop Image',
        chooseImage: 'Choose Image',
        noImage: 'Choose an image to start cropping',
        cancel: 'Cancel',
        confirm: 'Confirm',
      },
      notifications: {
        invalidFile: 'Invalid file',
        noImageToProcess: 'No image to process',
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
    AuthPage: {
      labels: {
        title: 'Le Bot',
        description: 'Your intelligent pet and good companion',
      },
    },
    MePage: {
      labels: {
        memberCenter: 'Member Center',
        memberCenterDescription: 'Points Redemption',
        serviceCenter: 'Service Center',
        serviceCenterDescription: 'Devices and Support',
        myOrders: 'My Orders',
        sharedDevices: 'Shared Devices',
        helpAndFeedback: 'Help & Feedback',
        aboutUs: 'About Us',
        settings: 'Settings',
      }
    }
  },
};
