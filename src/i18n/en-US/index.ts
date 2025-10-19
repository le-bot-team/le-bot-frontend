export default {
  components: {
    auth: {
      FinishPanel: {
        labels: {
          welcome: 'Welcome back, {username}!\n' + 'You have successfully signed in.',
          welcomeNew: 'Welcome, {username}!\n' + 'Your account has been created successfully.',
          redirect: 'Taking you back to the previous page...',
        },
      },
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
    },
    me: {
      ProfileCard: {
        labels: {
          signInOrSignUp: 'Sign In / Sign Up',
        },
      },
    },
    navigations: {
      labels: {
        home: 'Home',
        growth: 'Growth',
        mall: 'Mall',
        me: 'Me',
      },
    },
    AudioRecorder: {
      labels: {
        error: 'Error',
        hint: 'Click to start recording',
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
        labels: {},
      },
    },
    headers: {
      MainHeader: {
        labels: {
          title: 'Le Bot',
        },
      },
      StackHeader: {
        navigations: {
          about: 'About Us',
          auth: 'Authentication',
          profile: 'Profile',
          settings: 'Settings',
        }
      }
    },
  },
  pages: {
    main: {
      AuthPage: {
        labels: {
          title: 'Le Bot',
          description: 'Your intelligent pet and good companion',
        },
      },
      HomePage: {
        labels: {
          connect: 'Connect',
          disconnect: 'Disconnect',
          processing: 'Processing...',
          noUnfinishedMessage: 'No unfinished message',
        },
        notifications: {
          copiedAccessToken: 'Access token copied to clipboard',
          copyAccessTokenFailed: 'Failed to copy access token',
          notLoggedIn: 'You are not logged in, please sign in first',
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
        },
      },
    },
    stack: {
      AboutPage:{
        labels: {
          title: 'About Us',
          companyDescriptionTitle: 'Company Description',
          companyDescription: 'Le Bot is a cutting-edge technology company dedicated to creating intelligent and interactive robotic companions.\n' +
            'Our mission is to enhance the quality of life through innovative AI-driven solutions that bring joy, convenience, and companionship to users worldwide.',
        }
      },
      ProfilePage: {
        labels: {
          nickname: 'Nickname',
          bio: 'Bio',
          region: 'Region',
          notSet: 'Not Set',
          changePassword: 'Change Password',
          bindEmail: 'Bind Email',
          bindPhone: 'Bind Phone Number',
          removeAccount: 'Remove Account',
        }
      },
      SettingsPage: {
        labels: {
          profileSettings: 'Profile Settings',
          signInOrSignUp: 'Sign In / Sign Up',
          deliveryAddresses: 'Delivery Addresses',
          languageSettings: 'Language Settings',
          messageSettings: 'Message Settings',
          generalSettings: 'General Settings',
          privacySettings: 'Privacy Settings',
          permissionManagement: 'Permission Management',
          clearCache: 'Clear Cache',
          networkDiagnostics: 'Network Diagnostics',
          storageSpace: 'Storage Space',
          appVersion: 'App Version',
          privacyPolicy: 'Privacy Policy',
          termsOfService: 'Terms of Service',
          internetICPCode: 'Internet ICP Code: {code}',
          logout: 'Log Out',
        }
      }
    }
  },
};
