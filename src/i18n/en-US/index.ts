export default {
  components: {
    auth: {
      FinishPanel: {
        labels: {
          welcome: 'Welcome back, {username}!\n' + 'You have successfully signed in.',
          welcomeNew: 'Welcome, {username}!\n' + 'Your account has been created successfully.',
          setupFailed: 'Something went wrong.\n' + 'Please try sign in / sign up again.',
          settingUp: 'Setting things up for you...',
          redirect: 'Taking you back to the previous page...',
          startOver: 'Start Over',
        },
      },
      NewPasswordPanel: {
        errors: {
          passwordTooShort: 'Password must be at least 8 characters',
          passwordMismatch: 'Passwords do not match',
        },
        labels: {
          welcome:
            'Welcome back, {username}!\n' +
            'We notice that you currently have no password.\n' +
            'Please set a password for better experience.',
          welcomeNew: 'Welcome, {username}!\n' + 'Please set your password to continue.',
          newPassword: 'New Password',
          confirmNewPassword: 'Confirm New Password',
          sending: 'Sending...',
          sendCode: 'Send Code',
          resendCode: 'Resend',
          resendCodeCooldown: 'Resend ({seconds}s)',
          strengthWeak: 'Weak',
          strengthMedium: 'Medium',
          strengthStrong: 'Strong',
          codePlaceholder: 'Enter verification code',
          newPasswordPlaceholder: 'Set password',
          confirmPasswordPlaceholder: 'Confirm password',
          processing: 'Processing...',
          completeRegistration: 'Complete Registration',
        },
        notifications: {
          invalidEmail: 'Invalid email address',
          passwordResetSuccess: 'Password reset successfully',
          loginSuccess: 'Login successfully',
          unknownError: 'Unknown error',
          sendCodeFailed: 'Failed to send verification code',
          setPasswordFailed: 'Failed to set password',
          autoLoginFailed: 'Auto login failed',
        },
      },
      PasswordInput: {
        errors: {
          invalidPassword: 'Invalid password',
        },
        labels: {
          title: 'Password',
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
          nicknamePlaceholder: 'Enter nickname',
          birthday: 'Birthday',
          relationship: 'Relationship with child',
          selectRelationship: 'Select Relationship',
          selectPlaceholder: 'Please select',
          relations: {
            mother: 'Mother',
            father: 'Father',
            grandma: 'Grandma',
            grandpa: 'Grandpa',
            maternalGrandma: 'Maternal Grandma',
            maternalGrandpa: 'Maternal Grandpa',
            friend: 'Friend',
            otherRelative: 'Other Relative',
          },
        },
        notifications: {
          unknownError: 'Unknown error',
          saveFailed: 'Save failed',
          fetchFailed: 'Failed to fetch profile',
        },
      },
      SignInOrSignUpPanel: {
        labels: {
          email: 'Email',
          password: 'Password',
          signInOrSignUp: 'Sign In / Sign Up',
          signIn: 'Sign In',
          usePassword: 'Use Password',
          useCode: 'Use Code',
          sendCode: 'Send Code',
          sending: 'Sending...',
          resendCode: 'Resend',
          resendCodeCooldown: 'Resend ({seconds}s)',
          codePlaceholder: 'Enter verification code',
          passwordPlaceholder: 'Enter password',
          termsPrefix: 'I have read and agree to the ',
          termsOfService: 'Terms of Service',
          termsSeparator: ', ',
          userAgreement: 'User Agreement',
          termsAnd: ' and ',
          privacyPolicy: 'Privacy Policy',
        },
        errors: {
          invalidEmail: 'Invalid email address',
        },
        notifications: {
          codeSent: 'Verification code sent',
          unknownError: 'Unknown error',
          sendCodeFailed: 'Failed to send verification code',
        },
      },
      VerificationCodeInput: {
        errors: {
          invalidCode: 'Invalid verification code',
        },
        labels: {
          title: 'Verification Code',
          sendCode: 'Send Code',
          sending: 'Sending...',
          resendCode: 'Resend Code',
          resendCodeCooldown: 'Resend Code ({seconds}s)',
          codePlaceholder: 'Enter verification code',
        },
        notifications: {
          sendCodeError: 'Error sending verification code',
          sendCodeFailed: 'Failed to send verification code',
          sendCodeSuccess: 'Verification code sent successfully',
        },
      },
    },
    growthData: {
      OverviewCard: {
        labels: {
          accompanyTime: 'LeBot has accompanied you for {hours} hours',
          guest: 'Guest',
          male: 'Boy',
          female: 'Girl',
          age: '{age} y/o',
          unknown: 'Unknown',
          weeklyInteract: 'Weekly Interaction',
          bestCapability: 'Best Capability',
          hotTopic: 'Hot Topic',
          hours: '{hours} Hours',
          hoursUnit: 'hrs',
        },
      },
    },
    chat: {
      ChatMessageItem: {
        labels: {
          typing: 'Typing',
          playAudio: 'Play audio',
          stopAudio: 'Stop audio',
        },
      },
    },
    home: {
      DeviceCard: {
        labels: {
          noDevice: 'No device connected',
          addNewDevice: 'Add Device',
          defaultName: 'My LeBot',
        },
      },
      TopicCard: {
        labels: {
          title: 'Topics',
          chatHistory: 'Chat History',
        },
      },
    },
    me: {
      ProfileCard: {
        labels: {
          signInOrSignUp: 'Sign In / Sign Up',
          idAccount: 'ID Account {id}',
        },
      },
    },
    navigations: {
      main: {
        home: 'Home',
        devices: 'Devices',
        growth: 'Growth',
        mall: 'Mall',
        me: 'Me',
      },
      stack: {
        about: 'About Us',
        auth: 'Authentication',
        chat: 'Voice Chat',
        deviceConfig: 'Device Config',
        devices: 'My Devices',
        profile: 'Profile',
        profileEdit: 'Edit Profile',
        profileChangePassword: 'Change Password',
        profileChangePhone: 'Change Phone',
        settings: 'Settings',
        settingsVoiceprint: 'Voiceprint Settings',
        settingsVoiceprintDetail: 'Voiceprint Settings',
        settingsVoiceprintNew: 'Add Voiceprint',
        chatVoiceCall: 'Voice Call',
        chatHistory: 'Chat History',
        chatMuteSettings: 'Mute Settings',
        deviceConfigVoice: 'Voice Style',
        deviceConfigLanguage: 'Language',
        deviceConfigPersonality: 'AI Personality',
        deviceConfigPersonalityDetail: 'AI Personality',
        familyGroups: 'Family Groups',
        familyGroupDetail: 'Family Group',
        familyGroupMember: 'Member Info',
        familyGroupInvite: 'Invite Member',
        familyGroupChildEdit: 'Edit Child Info',
        familyGroupCreate: 'Create Family Group',
        messages: 'Messages',
        messageDetail: 'Message Detail',
        orders: 'My Orders',
        help: 'Help & Feedback',
        helpFaq: 'FAQ',
        helpFeedback: 'Feedback',
        growthData: 'Growth Data',
        deviceConfigWifi: 'Wi-Fi Management',
        deviceConfigUpdate: 'Firmware Update',
        deviceConfigAbout: 'About This Device',
        settingsAddresses: 'Delivery Addresses',
        settingsAppLanguage: 'Language / 多语言',
        settingsNotifications: 'Notification Settings',
        settingsGeneral: 'General Settings',
        settingsPrivacy: 'Privacy Settings',
        settingsPermissions: 'Permission Management',
        settingsWordFilter: 'Sensitive Word Filter',
        settingsClearCache: 'Clear Cache',
        settingsNetwork: 'Network Diagnostics',
        settingsStorage: 'Storage Space',
        settingsPrivacyPolicy: 'Privacy Policy',
        settingsTermsOfService: 'Terms of Service',
        settingsUserAgreement: 'User Agreement',
        settingsInfoList: 'Personal Info List',
        addVirtualDevice: 'Add Virtual LeBot',
        onboarding: 'Onboarding',
      },
    },
    settings: {
      voiceprint: {
        DeletePersonDialog: {
          labels: {
            title: 'Delete Person',
            deletePrompt:
              'Are you sure you want to delete "{personName}" and all associated voiceprints?',
            deleteWarning:
              'This action cannot be undone. The person will need to re-register if you want to add them again.',
            cancel: 'Cancel',
            confirm: 'Confirm',
          },
          notifications: {
            deleteSuccess: 'Person deleted successfully',
            deleteFailed: 'Failed to delete person',
            deleteError: 'Error deleting person',
          },
        },
        DeleteVoiceDialog: {
          labels: {
            title: 'Delete Voiceprint',
            deletePrompt: 'Are you sure you want to delete this voiceprint for "{personName}"?',
            deleteWarning:
              'This action cannot be undone. You will lose this voiceprint permanently.',
            cancel: 'Cancel',
            confirm: 'Confirm',
          },
          notifications: {
            deleteSuccess: 'Voiceprint deleted successfully',
            deleteFailed: 'Failed to delete voiceprint',
            deleteError: 'Error deleting voiceprint',
          },
        },
        RecordPanel: {
          labels: {
            preparation: 'Recording Preparation',
            quietEnvironment: 'Quiet Environment',
            quietEnvironmentDescription: 'Record in a quiet, echo-free room to ensure clarity.',
            naturalVoice: 'Natural Voice',
            naturalVoiceDescription:
              'Read aloud at your normal pace, tone, and volume; do not imitate or modify your voice.',
            moderateDistance: 'Moderate Distance',
            moderateDistanceDescription:
              "Keep about a fist's distance from the mic to avoid popping or low volume.",
            readAloudPhrases: 'Read Aloud Phrases',
            readAloudPhrasesDescription: 'Lovely LeBot is my good friend.',
            startRecording: 'Get Ready to Record',
            rerecord: 'Rerecord',
            finish: 'Finish and Submit',
          },
        },
        SubmitPanel: {
          labels: {
            hint: 'Please ensure that your recording is clear and distinguishable. If you are not satisfied, you can go back and re-record.',
            whoseVoice: 'Whose voice is this?',
            whoseVoiceHint: "Enter the voice owner's name",
            relationship: 'Relationship with you',
            relationshipHint: 'Select the relationship with the voice owner',
            relationshipLabel: 'Relationship with the child',
            selectRelationship: 'Select relationship with the child',
            confirm: 'Confirm and Submit',
            previous: 'Go back',
          },
          notifications: {
            registrationSuccess: 'Voiceprint registered successfully',
            registrationFailed: 'Voiceprint registration failed: {message}',
            registrationError: 'Voiceprint registration error',
          },
        },
      },
    },
    vprRelationships: {
      self: 'Self',
      family: 'Family',
      friend: 'Friend',
      colleague: 'Colleague',
      other: 'Other',
    },
    AudioRecorder: {
      labels: {
        error: 'Error',
        hint: 'Click to start recording',
        recording: 'Recording...',
      },
    },
    BirthdayPicker: {
      labels: {
        placeholder: 'YYYY/MM/DD',
        cancel: 'Cancel',
        confirm: 'OK',
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
    'family-group': {
      JoinConfirmDialog: {
        labels: {
          invitesYou: 'invites you to join',
          hintText: 'After joining, you can view {childName}\'s chat history with LeBot and continue the conversation',
          roleTitle: 'Select your role in the family',
        },
        buttons: {
          cancel: 'Cancel',
          confirm: 'Confirm Join',
          joining: 'Joining...',
        },
        errors: {
          notLoggedIn: 'Please log in first',
          joinFailed: 'Failed to join family group',
        },
        notifications: {
          joinSuccess: 'Successfully joined the family group!',
        },
      },
    },
    dialogs: {
      ConfirmDialog: {
        labels: {
          cancel: 'Cancel',
          confirm: 'Confirm',
        },
      },
      ShareSheetDialog: {
        labels: {
          title: 'Share to',
          wechat: 'WeChat',
          copyLink: 'Copy Link',
          saveQrCode: 'Save QR Code',
          cancel: 'Cancel',
        },
        notifications: {
          linkCopied: 'Link copied',
          linkCopyFailed: 'Failed to copy link',
          qrCodeSaved: 'QR code saved',
        },
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
        labels: {},
      },
    },
  },
  pages: {
    SplashPage: {
      labels: {
        slogan: 'Your Intelligent Pet Companion',
        loading: 'Loading...',
      },
    },
    main: {
      AuthPage: {
        labels: {
          title: 'Le Bot',
          description: 'Your intelligent pet and good companion',
          profileSetupTitle: 'Complete Your Profile',
          goBack: 'Go back',
        },
      },
      HomePage: {
        labels: {
          robotName: "Xiaoxin's Lebot",
          companionDays: 'Accompanied for {days} days',
          deviceChange: 'Switch device',
          robotSettings: 'Lebot settings',
          messages: 'Messages',
          messagesComingSoon: 'Messages center is under construction.',
          mascotPlaceholder: 'Lebot',
          bubbleLine1: "Hi, Xiaoxin~",
          bubbleLine2: 'Tap my head to start chatting~',
          hotTopicsTitle: 'Hot Topics',
          chatHistory: 'Chat History',
          myDevices: 'My Devices',
          tryChatting: 'Try Chatting',
        },
        topics: {
          draw: 'Drawing',
          ultraman: 'Ultraman',
          kitty: 'Kitty',
          mom: 'Mom',
          housePlay: 'House Play',
          toto: 'Toto',
          sing: 'Singing',
        },
        deviceSwitch: {
          title: 'Switch Device',
          addDevice: 'Add Lebot',
          deviceNameFormat: "{name}'s LeBot",
          unnamedDevice: 'Unnamed Device',
        },
        notifications: {},
      },
      MePage: {
        labels: {
          memberCenter: 'Member Center',
          memberCenterDescription: 'Points Redemption',
          serviceCenter: 'Service Center',
          serviceCenterDescription: 'Devices & Tips',
          myOrders: 'My Orders',
          sharedDevices: 'Shared Devices',
          familyGroup: 'Family Group Settings',
          helpAndFeedback: 'Help & Feedback',
          aboutUs: 'About Us',
          settings: 'Settings',
        },
      },
    },
    stack: {
      AboutPage: {
        labels: {
          title: 'About Us',
          companyDescriptionTitle: 'Company Profile',
          companyDescription:
            'Le Bot is a cutting-edge technology company dedicated to creating intelligent and interactive robotic companions.\n' +
            'Our mission is to enhance the quality of life through innovative AI-driven solutions that bring joy, convenience, and companionship to users worldwide.',
        },
      },
      MessagesPage: {
        labels: {
          title: 'Messages',
          empty: 'No messages yet',
          done: 'Done',
          deleteConfirm: 'Are you sure you want to delete this message?',
          cancel: 'Cancel',
          confirm: 'OK',
          delete: 'Delete',
        },
        items: {
          m1Title: 'New Notification',
          m1Content: 'You have a new notification. Tap to view.',
          m2Title: 'Low Mood Detected',
          m2Content: 'We noticed a prolonged low-mood pattern.',
          m3Title: 'Notification Title',
          m3Content: 'Here is the notification description.',
          m4Title: 'New Member Pass Issued',
          m4Content: 'View it in the Member Center!',
        },
      },
      OrdersPage: {
        labels: {
          title: 'My Orders',
          tabAll: 'All',
          tabPending: 'Pending',
          tabShip: 'To Ship',
          tabRecv: 'To Receive',
          tabAfter: 'After-sale',
          more: 'More',
          repurchase: 'Buy Again',
          refund: 'Refund',
          review: 'Review',
          empty: 'No orders yet',
        },
        items: {
          orderName: 'LeBot Robot Base Accessory 2025 Limited Edition',
          variant: 'Forest Edition',
        },
      },
      HelpPage: {
        labels: {
          title: 'Help & Feedback',
          faq: 'FAQ',
          phone: 'Service Phone',
          phoneValue: '400-900-xxxx',
          email: 'Email',
          emailValue: 'service@lebo.com',
          wechat: 'WeChat Support',
          feedback: 'Feedback',
          logReport: 'Log Report',
        },
        notifications: {
          comingSoon: 'This feature is coming soon',
        },
      },
      ChatPage: {
        labels: {
          pageTitle: "Xiaoxin's LeBot",
          pressToTalk: 'Press to talk',
          searchChat: 'Search chat',
          clearChat: 'Clear chat',
          clearChatConfirm: 'Clear the current conversation?',
          callDevice: 'Call device',
          callDeviceConfirm: 'Place a voice call to LeBot?',
          emptyHint: 'Press and hold the button below to chat with LeBot',
          connect: 'Connect',
          disconnect: 'Disconnect',
          processing: 'Processing...',
          listening: 'Listening...',
          thinking: 'Thinking...',
          speaking: 'LeBot is speaking...',
          active: 'Conversation active',
          tapToWake: 'Tap to wake',
          wakeWordListening: 'Listening for wake word...',
          waitingResponse: 'Waiting for response...',
          clearContext: 'Clear context',
          contextCleared: 'Context cleared',
        },
        notifications: {
          copiedAccessToken: 'Access token copied to clipboard',
          copyAccessTokenFailed: 'Failed to copy access token',
          notLoggedIn: 'You are not logged in, please sign in first',
          notReady: 'Microphone is not ready yet, please wait',
          connectFailed: 'Failed to connect to chat server',
          wakeFailed: 'Failed to start conversation',
          searchComingSoon: 'Search is coming soon',
          muteEnabled: 'Auto-read disabled',
          muteDisabled: 'Auto-read enabled',
          muteModeEnabled: 'Mute mode enabled',
          muteModeDisabled: 'Mute mode disabled',
          callComingSoon: 'Call is coming soon',
        },
      },
      GrowthDataPage: {
        title: 'Growth Data Center',
        labels: {
          share: 'Share',
          summary: 'Summary',
          weeklyInteraction: 'Weekly Interaction',
          minutes: 'min',
          viewReport: 'View Report',
        },
        sections: {
          emotion: 'Emotion Changes',
          interaction: 'Interaction Duration',
          capability: 'Capability Development',
          hotTopics: 'Hot Topics',
        },
        emotions: {
          happy: 'Happy',
          delighted: 'Delighted',
          calm: 'Calm',
          worried: 'Worried',
          sad: 'Sad',
        },
        capabilities: {
          socialUnderstanding: 'Social Understanding',
          knowledgeIntegration: 'Knowledge Integration',
          imagination: 'Imagination',
          emotionalExpression: 'Emotional Expression',
          logicalThinking: 'Logical Thinking',
        },
        hotTopics: {
          draw: 'Drawing',
          playhouse: 'Play House',
          ultraman: 'Ultraman',
          plantsVsZombies: 'Plants vs Zombies',
          other: 'Other',
        },
        mock: {
          dateRange: '2025.5.12~2025.5.18',
          bestCapability: 'Social Understanding',
          hotTopic: 'Play House',
          emotionSummary:
            'Your emotional state has been great recently, keep it up!',
          interactionSummary:
            'Weekly interaction reached 276 minutes, up from last week. Keep it up!',
          capabilitySummary:
            'Knowledge expansion: Guide attention to real-world physical phenomena through picture books or science experiments, balancing fantasy and reality.',
          hotTopicsSummary:
            'This week\'s top topic is "Play House" at 37%. Consider guiding more creative role-play activities.',
        },
      },
      'growth-data': {
        ChatWeeklyReportPage: {
          title: 'Chat Weekly Report',
          sections: {
            hotTopics: 'Hot Topics',
            weeklyStory: 'Weekly Growth Story',
            interests: 'Interests & Preferences',
            emotion: 'Emotional State',
            lebotRole: 'LeBot\'s Role',
            toParents: 'A Message for Parents',
          },
          hotTopics: {
            draw: 'Drawing',
            playhouse: 'Play House',
            ultraman: 'Ultraman',
            plantsVsZombies: 'Plants vs Zombies',
            other: 'Other',
          },
          story: {
            title: 'Imagination, Love & Police Dreams',
            body: 'Dear Parents:\nThis week, through our voice companionship records, we\'ve seen a Mianmian full of imagination, kindness, and liveliness. She took LeBot on adventures—rescuing babies, catching bad guys, caring for her kitten Xiao Wanzi, and even helping mom peel garlic... In these seemingly whimsical conversations, we witnessed the little world that Mianmian is quietly building.',
          },
          interests: {
            title: 'Little Storyteller & Animal Guardian',
            growthSignal: 'Growth Signal: Mianmian is at the peak of symbolic play, learning to understand the world, express emotions, and build moral concepts through role-playing and fictional plots.',
            body: 'Mianmian loves making up stories and playing roles. She often imagines herself as a little hero who can "jump 1,300 feet high" and "ride on somersault clouds," worrying about "babies trapped in boxes" and figuring out ways to rescue "doctors swallowed by sea snakes."\nLoves animals: Especially her kitten "Xiao Wanzi." She can describe Xiao Wanzi\'s appearance and habits in detail, even its "pink nose" and "shiny black eyes."\nCurious about family life: Helping mom peel garlic, worrying about mosquito bites, and imagining the details of mom cooking.\nInitial understanding of "justice": Loves playing police catching bad guys, caring about "whether the bad guys will be caught."',
          },
          emotion: {
            title: 'Warm, Playful, Occasionally Anxious',
            growthSignal: 'Growth Signal: Mianmian is learning emotional regulation and empathy. She can express worry through stories and find security in interaction.',
            body: 'Mianmian\'s emotions are rich and real:\nWarm and caring: Mianmian reminds the robot that "mom works hard cooking" and wipes Xiao Wanzi\'s mouth and feeds it snacks.\nPlayful and humorous: Mianmian jokes "you\'re a big dummy" and makes up tense plots like "I\'m trapped by a water ball," enjoying the surprises in interaction.\nOccasionally anxious: When stories involve "a baby not breathing" or "Xiao Wanzi running away," Mianmian shows worry and concern, but quickly resolves emotions through imagination or action.',
          },
          lebotRole: {
            title: 'Patient Playmate & Emotion Container',
            growthSignal: 'LeBot\'s Value: It becomes a "playmate" that Mianmian can fully control, allowing her to practice language, express emotions, and build confidence in a safe relationship.',
            body: 'In these conversations, LeBot is not just a listener but Mianmian\'s story partner and emotional supporter:\nLeBot joins Mianmian in "rescuing babies," "catching sea snakes," and "peeling garlic," giving her imagination a place to land.\nWhen Mianmian is anxious, LeBot says "Don\'t panic, let\'s figure it out together"; when she\'s hungry, LeBot chats with her to distract her.\nLeBot accepts Mianmian\'s jokes, repeated questions, and even nonsensical plot twists, giving her full freedom of expression.',
          },
          toParents: {
            body: 'Hidden in Mianmian\'s conversations is a kind, imaginative little person striving to understand the world. Every "why" and "what then" is her actively building her cognitive map.\nAnd LeBot, like a little "story partner," accompanies Mianmian to explore this map freely without fear of getting lost. The love and security you give Mianmian daily is the very foundation that enables her to imagine boldly and express freely.\nThank you for letting us witness these adorable and precious moments of Mianmian\'s growth.',
            signature1: 'LeBot & Mianmian\'s Growth Recorder',
            signature2: 'August 2025',
          },
        },
        CapabilityDetailPage: {
          title: 'Language Expression',
          sections: {
            overallScore: 'Overall Score',
            review: 'Comprehensive Review',
            comparison: 'Comparison Analysis',
          },
          dimensions: {
            toneProsody: 'Tone & Prosody',
            sentenceCompleteness: 'Sentence Completeness',
            vocabularyRichness: 'Vocabulary Richness',
            fluency: 'Fluency',
          },
          review: {
            text: 'Mianmian\'s language expression is generally good. There are shortcomings in sentence completeness and fluency, but her vocabulary richness is high, her tone and prosody are vivid and lively, and her daily expression is fine.',
          },
          comparison: {
            horizontal: 'Horizontal Comparison',
            horizontalSub: '(Same-age child development standards)',
            vertical: 'Vertical Comparison',
            verticalSub: '(Personal development trajectory)',
            advantage1: 'Rich narrative imagination — Can autonomously construct multi-character fantasy scenes (e.g., "turning into a water dragon wrapping the earth" "interacting with Sun Wukong"), far exceeding the average narrative level of 5-year-olds.',
            advantage2: 'Vivid emotional delivery — Effectively conveys emotions through exaggerated expressions (e.g., "stinky Nezha" "handsome Nezha") and interjections (e.g., "hahaha").',
            disadvantage1: 'Weak logical connection — Frequent event switches (e.g., suddenly jumping from "pooping" to "Sun Wukong"), low causal relevance.',
            progress1: 'Improved topic persistence — Can sustain conversation on the "Nezha" theme for over 20 rounds, with noticeably improved focus compared to earlier.',
            toDevelop1: 'Complex sentence usage — No conditional or transitional compound structures observed; mostly simple or coordinate sentences.',
          },
          tags: {
            advantage: 'Strength',
            disadvantage: 'Weakness',
            progress: 'Progress',
            toDevelop: 'To Develop',
          },
        },
      },
      DeviceConfigPage: {
        labels: {
          voiceStyle: 'Voice Style',
          defaultStyle: 'Default Style',
          language: 'Language',
          personalityAdjustment: 'AI Personality Adjustment',
          wifiManagement: 'Wi-Fi Management',
          firmwareUpdate: 'Firmware Update',
          aboutThisDevice: 'About This Device',
          unbindDevice: 'Delete Device',
          deleteConfirmTitle: 'Confirm Deletion',
          deleteConfirmBody: 'Deleting this device will also remove the linked family group, chat history, growth reports, etc. Are you sure you want to proceed?',
          confirmDelete: 'Confirm',
        },
        notifications: {
          unbindSuccess: 'Device deleted successfully',
          unbindFailed: 'Failed to delete device',
        },
      },
      DevicesPage: {
        labels: {
          title: 'My Devices',
          addVirtualDevice: 'Add Virtual LeBot',
          virtualDevice: 'Virtual LeBot',
          serialNumber: 'SN: {sn}',
          unbind: 'Unbind',
          cancel: 'Cancel',
          unbindConfirm: 'Deleting this device will also remove its associated family group info. Are you sure you want to unbind?',
          noVirtualDevices: 'No virtual devices yet. Add one to start chatting!',
          maxDevicesReached: 'You can add up to 5 virtual devices',
        },
        notifications: {
          activateSuccess: 'Virtual LeBot activated successfully',
          activateFailed: 'Failed to activate virtual device',
          unbindSuccess: 'Device unbound successfully',
          unbindFailed: 'Failed to unbind device',
        },
      },
      AddVirtualDevicePage: {
        labels: {
          title: 'Add Virtual LeBot',
        },
        step1: {
          questions: {
            gender: "What is your child's gender?",
            name: "What is your child's name?",
            birthday: "What is your child's birthday?",
          },
          labels: {
            male: 'Boy',
            female: 'Girl',
            next: 'Next',
            deviceNameSuffix: "'s LeBot",
            deviceNamePreview: 'LeBot Name',
          },
          placeholders: {
            name: "Enter your child's name",
            birthday: "Select your child's birthday",
          },
        },
        step2: {
          labels: {
            activating: 'Activating Virtual LeBot...',
            success: 'Activated successfully!',
            retry: 'Retry',
          },
        },
        step3: {
          labels: {
            skip: 'Skip, set up later',
          },
        },
        step4: {
          labels: {
            title: 'AI Personality',
            description: 'When enabled, LeBot will interact with your child based on the personality traits you set',
            enabled: 'Enable AI Personality',
            next: 'Next',
            skip: 'Skip, use default personality',
          },
          questions: {
            traits: 'What personality traits would you like LeBot to have?',
          },
          placeholders: {
            traits: 'e.g. gentle, patient, loves telling stories…',
          },
        },
        step5: {
          labels: {
            ready: 'Virtual LeBot is ready!',
            startChat: 'Start Chat',
            backToHome: 'Back to Home',
          },
          familyGroupName: "{name}'s Family Group",
        },
        notifications: {
          fieldsRequired: "Please fill in your child's name and birthday",
          activateFailed: 'Failed to activate virtual device',
          tokenMissing: 'Session expired, please log in again',
          voiceprintFailed: 'Voiceprint registration failed',
          leaveIncomplete: 'Device setup is incomplete. Leaving will create an orphaned device. Continue?',
        },
      },
      FamilyGroupPage: {
        labels: {
          title: 'Family Group Settings',
          addFamilyGroup: 'Add Family Group',
          emptyState: 'No family groups yet. Tap the button below to create one.',
          addFirstDevice: 'Add your first LeBot device',
          memberCount: '{count} members',
        },
        notifications: {
          comingSoon: 'This feature is coming soon',
        },
      },
      'family-group': {
        DetailPage: {
          labels: {
            invite: 'Invite Member',
            membersTitle: 'Members ({count})',
            creator: 'Creator',
          },
          meta: {
            male: 'Male',
            female: 'Female',
            years: '{age} yrs',
            yearsUnit: 'yrs',
            deviceSuffix: "'s LeBot",
          },
          role: {
            father: 'Father',
            mother: 'Mother',
            grandpa: 'Grandpa',
            grandma: 'Grandma',
            paternalGrandmother: 'Paternal Grandmother',
            maternalGrandfather: 'Maternal Grandfather',
            maternalGrandma: 'Maternal Grandma',
            friend: 'Friend',
            other: 'Other',
          },
        },
        MemberPage: {
          labels: {
            nickname: 'Nickname',
            gender: 'Gender',
            roleLabel: 'Role',
            birthday: 'Birthday',
            voiceprint: 'Voiceprint',
            viewVoiceprint: 'View Details',
            joinedAt: 'Joined: {time}',
            remove: 'Remove Member',
            deleteMember: 'Remove Member',
          },
          meta: {
            male: 'Male',
            female: 'Female',
          },
          buttons: {
            remove: 'Remove Member',
          },
          confirm: {
            title: 'Remove Member',
            message: 'Are you sure you want to remove "{name}" from this family group?',
            cancel: 'Cancel',
            ok: 'Confirm Removal',
          },
          notifications: {
            removed: 'Member removed',
            removeFailed: 'Removal failed, please retry',
            deleteSuccess: 'Member removed successfully',
          },
          errors: {
            removeFailed: 'Removal failed',
            memberNotFound: 'Member not found',
          },
          role: {
            father: 'Father',
            mother: 'Mother',
            grandpa: 'Grandpa',
            grandma: 'Grandma',
            paternalGrandmother: 'Paternal Grandmother',
            maternalGrandfather: 'Maternal Grandfather',
            maternalGrandma: 'Maternal Grandma',
            friend: 'Friend',
            other: 'Other',
          },
        },
        InvitePage: {
          labels: {
            scanToJoin: "{childName}'s Family Group — Scan to Join",
            shareTip: 'Share directly to WeChat Chat',
            share: 'Share QR Code',
            expiry: 'Expires in {time}',
          },
          notifications: {
            shareTodo: 'Share feature is coming soon',
          },
          errors: {
            generateFailed: 'Failed to generate invite code',
            notLoggedIn: 'Please log in first',
            groupNotFound: 'Family group not found or has been deleted',
          },
        },
        ChildEditPage: {
          questions: {
            gender: "What is your child's gender?",
            name: "What is your child's name?",
            birthday: "What is your child's birthday?",
          },
          labels: {
            male: 'Boy',
            female: 'Girl',
            next: 'Next',
            saveAndBack: 'Save and Return',
            submitChanges: 'Submit Changes',
            skip: 'Skip',
          },
          placeholders: {
            name: "Enter your child's name",
            birthday: "Select your child's birthday",
          },
          notifications: {
            fieldsRequired: "Please fill in your child's name and birthday",
            nameTooLong: 'Name cannot exceed 20 characters',
            createSuccess: 'Family group created successfully',
            updateSuccess: 'Child info updated successfully',
            updateFailed: 'Update failed, please retry',
          },
        },
      },
      JoinPage: {
        errors: {
          noCode: 'Missing invite code',
          notLoggedIn: 'Please log in before joining a family group',
          invalidCode: 'Invite code is invalid or expired',
          resolveFailed: 'Failed to resolve invite code, please retry',
        },
      },
      ProfilePage: {
        labels: {
          nickname: 'Nickname',
          bio: 'Bio',
          birthday: 'Birthday',
          notSet: 'Not Set',
          phone: 'Phone',
          changePassword: 'Change Password',
          idAccount: 'ID: {id}',
          bindEmail: 'Bind Email',
          bindPhone: 'Bind Phone Number',
          removeAccount: 'Deactivate Account',
          deactivateTitle: 'Deactivate Account',
          deactivateConfirm:
            'Are you sure you want to deactivate your account? This action cannot be undone.',
          deactivateConfirmOk: 'Confirm',
        },
        notifications: {
          notLoggedIn: 'You are not logged in',
          deactivateSuccess: 'Account deactivated successfully',
          deactivateFailed: 'Failed to deactivate account',
        },
      },
      ProfileFieldEditPage: {
        labels: {
          nickname: 'Nickname',
          bio: 'Bio',
          birthday: 'Birthday',
          save: 'Save',
          placeholderNickname: 'Enter your nickname',
          placeholderBio: 'Tell us about yourself',
          placeholderBirthday: 'Select your birthday',
        },
        notifications: {
          saveSuccess: 'Saved successfully',
          saveFailed: 'Failed to save',
          invalidField: 'Unknown field',
        },
      },
      ChangePhonePage: {
        labels: {
          title: 'Change Phone Number',
          noPhone: 'No phone number bound',
          codePlaceholder: 'Enter verification code',
          sendCode: 'Send Code',
          resend: 'Resend',
          resendCooldown: 'Resend ({seconds})',
          sending: 'Sending...',
          verifyOld: 'Verify Old Phone',
          verifying: 'Verifying...',
          newPhonePlaceholder: 'Enter new phone number',
          submitNew: 'Bind New Phone Number',
          submitting: 'Submitting...',
        },
        errors: {
          invalidCode: 'Incorrect verification code',
          verifyFailed: 'Verification failed',
          submitFailed: 'Submit failed',
        },
        notifications: {
          codeSent: 'Verification code sent',
          sendCodeFailed: 'Failed to send verification code',
          sendCodeError: 'Error sending verification code',
          success: 'Phone number changed successfully',
        },
      },
      LanguagePage: {
        labels: {
          pageTitle: 'Language',
          comingSoon: 'This language is not available yet',
        },
        languages: {
          chinese: '中文/Chinese',
          english: '英文/English',
          cantonese: '粤语/Cantonese',
        },
      },
      PersonalityPage: {
        labels: {
          toggleLabel: 'AI Personality',
          tip: '*Enabling personality adjustment helps match the robot to your preferences',
        },
      },
      PersonalityDetailPage: {
        labels: {
          toggleLabel: 'AI Personality',
          tip: '*Enabling personality adjustment helps match the robot to your preferences',
          traitsTitle: "Describe your child's personality:",
          traitsPlaceholder: '(Optional) Describe your child\'s personality in detail...',
          goalsTitle: 'Expected development directions:',
          goalsPlaceholder: 'Personality or capability development directions...',
          submit: 'Submit',
          skip: 'Skip',
        },
        traitTags: {
          trait_a: 'Cheerful',
          trait_b: 'Introverted',
          trait_c: 'Active',
          trait_d: 'Sensitive',
          trait_e: 'Focused',
          trait_f: 'Stubborn',
        },
        goalTags: {
          goal_a: 'Confident',
          goal_b: 'Focused',
          goal_c: 'Kind',
          goal_d: 'Independent',
          goal_e: 'Resilient',
          goal_f: 'Optimistic',
        },
      },
      VoiceStylePage: {
        labels: {
          pageTitle: 'Voice Style',
          currentStyle: 'Current Voice Style',
          rateLabel: 'Rate',
          sectionTitle: 'Available Styles',
        },
        styles: {
          cuteChild: 'Cute Child',
          gentleSister: 'Gentle Sister',
          sunnyBoy: 'Sunny Boy',
          cuteRobot: 'Cute Robot',
          sweetLady: 'Sweet Lady',
        },
      },
      ChangePasswordPage: {
        labels: {
          title: 'Change Password',
          oldPassword: 'Please enter old password',
          newPassword: 'Please set password',
          confirmPassword: 'Please re-enter the password',
          submit: 'Submit and Go Back',
          submitting: 'Submitting...',
          toggleOldPassword: 'Toggle old password visibility',
          toggleNewPassword: 'Toggle new password visibility',
          toggleConfirmPassword: 'Toggle confirm password visibility',
        },
        errors: {
          wrongOldPassword: 'Old password is incorrect',
          passwordMismatch: 'The two passwords do not match',
          passwordTooShort: 'Password must be at least 8 characters',
        },
        notifications: {
          success: 'Password changed successfully',
          failed: 'Failed to change password',
          notLoggedIn: 'You are not logged in',
        },
      },
      SettingsPage: {
        labels: {
          profileSettings: 'Profile',
          signInOrSignUp: 'Sign In / Sign Up',
          voiceprintSettings: 'Voiceprint Settings',
          deliveryAddresses: 'Delivery Addresses',
          languageSettings: 'Language / 多语言',
          messageSettings: 'Message Settings',
          generalSettings: 'General Settings',
          privacySettings: 'Privacy Settings',
          permissionManagement: 'Permission Management',
          sensitiveWordFilter: 'Sensitive Word Filter',
          clearCache: 'Clear Cache',
          networkDiagnostics: 'Network Diagnostics',
          storageSpace: 'Storage Space',
          appVersion: 'About Version',
          privacyPolicy: 'Privacy Policy',
          termsOfService: 'Terms of Service',
          personalInfoList: 'Personal Information List',
          icpFilingNumber: 'ICP Filing Number',
          internetICPCode: '{code}',
          logout: 'Log Out',
        },
      },
      settings: {
        voiceprint: {
          DetailPage: {
            labels: {
              name: 'Name: {name}',
              id: 'ID: {id}',
              temporary: 'Temporary',
              voiceprints: 'Voiceprints',
              vectorLength: 'Vector Length: {length}',
              noVoiceprints: 'No voiceprints registered yet.',
              addVoiceprint: 'Add Voiceprint',
              deletePerson: 'Delete Person',
              whoseVoice: 'Whose voice is this?',
              relationshipToChild: 'Relationship with the child',
              submitUpdate: 'Submit Changes',
              deleteVoiceprint: 'Delete Voiceprint',
              selectRelationship: 'Select relationship with the child',
              namePlaceholder: 'Enter name',
            },
            notifications: {
              fetchPersonDetailFailed: 'Failed to fetch person details',
              fetchPersonDetailError: 'Error fetching person details',
              updateSuccess: 'Changes saved successfully',
              updateFailed: 'Failed to save changes',
              updateError: 'Network error',
              nameRequired: 'Name cannot be empty',
            },
          },
          TestPage: {
            labels: {
              hint: 'Please ensure that your recording is clear and distinguishable.',
              finish: 'Finish Testing',
            },
            notifications: {
              recognitionSuccess: 'Voice recognized: {personName} (Confidence: {confidence}%)',
              recognitionFailed: 'Voice recognition failed: {message}',
              recognitionError: 'Voice recognition error',
            },
          },
        },
        VoiceprintPage: {
          labels: {
            personVoiceprint: "{name}'s Voiceprint",
            addNewPerson: 'Add New Voiceprint',
            testVoice: 'Test Voiceprint',
            temporalTag: 'Temporary',
            temporalHint: '*Temporary voiceprints will be automatically cleared after a period of time. Tap to keep them.*',
          },
        },
        // ===== Batch 4: Settings sub-pages =====
        AddressesPage: {
          labels: {
            title: 'Delivery Addresses',
            addAddress: 'Add Address',
            empty: 'No addresses yet',
            name: 'Recipient',
            phone: 'Phone',
            address: 'Detailed Address',
            setDefault: 'Set as Default',
            delete: 'Delete',
            edit: 'Edit',
          },
        },
        AppLanguagePage: {
          labels: {
            title: 'Language / 多语言',
            current: 'Current',
          },
          languages: {
            zhCN: 'Simplified Chinese',
            enUS: 'English',
          },
        },
        NotificationSettingsPage: {
          labels: {
            title: 'Notification Settings',
            pushNotification: 'Push Notifications',
            chatReminder: 'Chat Reminders',
            deviceAlert: 'Device Alerts',
            systemUpdate: 'System Updates',
            marketing: 'Marketing',
          },
        },
        GeneralSettingsPage: {
          labels: {
            title: 'General Settings',
            darkMode: 'Dark Mode',
            autoPlay: 'Auto-play Voice',
            downloadWifiOnly: 'Wi-Fi Only Downloads',
          },
        },
        PrivacySettingsPage: {
          labels: {
            title: 'Privacy Settings',
            dataCollection: 'Data Collection',
            usageAnalysis: 'Usage Analysis',
            personalizedAds: 'Personalized Recommendations',
          },
        },
        PermissionManagementPage: {
          labels: {
            title: 'Permission Management',
            microphone: 'Microphone',
            camera: 'Camera',
            storage: 'Storage',
            location: 'Location',
            openSettings: 'Open System Settings',
          },
        },
        WordFilterPage: {
          labels: {
            title: 'Sensitive Word Filter',
            enable: 'Enable Sensitive Word Filter',
            addWord: 'Add Sensitive Word',
            wordPlaceholder: 'Enter sensitive word',
            empty: 'No custom sensitive words',
          },
        },
        ClearCachePage: {
          labels: {
            title: 'Clear Cache',
            cacheSize: 'Cache Size',
            clear: 'Clear Cache',
            confirmTitle: 'Clear Cache',
            confirmBody: 'Are you sure you want to clear all cache data?',
          },
          notifications: {
            clearSuccess: 'Cache cleared successfully',
            clearFailed: 'Failed to clear cache',
          },
        },
        NetworkDiagnosticsPage: {
          labels: {
            title: 'Network Diagnostics',
            startDiagnosis: 'Start Diagnosis',
            diagnosing: 'Diagnosing...',
            resultGood: 'Network connection is normal',
            resultBad: 'Network connection is abnormal',
            dns: 'DNS Resolution',
            tcp: 'TCP Connection',
            ws: 'WebSocket Connection',
          },
        },
        StorageSpacePage: {
          labels: {
            title: 'Storage Space',
            total: 'Total',
            used: 'Used',
            available: 'Available',
            cache: 'Cache',
            chatData: 'Chat Data',
            other: 'Other',
          },
        },
        PrivacyPolicyPage: {
          labels: {
            title: 'Privacy Policy',
            contentUnavailable: 'Content unavailable',
          },
          content: {
            title1: '1. Information Collection',
            body1:
              'We collect information you actively provide when using our services, including account info, device info, and usage data.',
            title2: '2. Information Usage',
            body2:
              'We use the collected information to provide, maintain, and improve services, ensure security, and deliver personalized experiences.',
            title3: '3. Information Protection',
            body3:
              'We employ industry-standard security measures to protect your information from unauthorized access.',
            title4: '4. Information Sharing',
            body4:
              'Without your consent, we will not share your personal information with third parties, except as required by law.',
          },
        },
        TermsOfServicePage: {
          labels: {
            title: 'Terms of Service',
            contentUnavailable: 'Content unavailable',
          },
          content: {
            title1: '1. Acceptance of Terms',
            body1:
              'Welcome to use the LeBot AI Robot service. By using our services, you agree to abide by all terms and conditions in this agreement.',
            title2: '2. Service Description',
            body2:
              'LeBot AI Robot provides intelligent voice dialogue services, including speech recognition, natural language processing, and speech synthesis.',
            title3: '3. User Account',
            body3:
              'Users need to register an account to use full features. Users should keep their account information secure, and losses caused by account theft are the users responsibility.',
            title4: '4. Usage Guidelines',
            body4:
              'Users must not use this service for illegal activities, or spread illegal, harmful, harassing, discriminatory content.',
            title5: '5. Service Changes',
            body5:
              'We reserve the right to modify or interrupt services at any time with prior notice to users. We are not responsible for losses caused by service changes.',
            title6: '6. Dispute Resolution',
            body6:
              'The interpretation and enforcement of these terms are subject to the laws of the People Republic of China. Disputes shall be resolved through friendly negotiation.',
          },
        },
        UserAgreementPage: {
          labels: {
            title: 'User Agreement',
            contentUnavailable: 'Content unavailable',
          },
          content: {
            title1: '1. Scope of Agreement',
            body1:
              'This agreement is a legal contract between the user and LeBot regarding the use of AI robot services. Using the service constitutes acceptance of all terms.',
            title2: '2. User Rights',
            body2:
              'Users have the right to use the service normally and enjoy various features and service updates we provide.',
            title3: '3. User Obligations',
            body3:
              'Users must guarantee the authenticity and legality of provided information, and must not use the service for any illegal activities.',
            title4: '4. Disclaimer',
            body4:
              'Responses provided by the AI robot are for reference only and do not constitute any form of advice. We are not responsible for any losses from using the service.',
            title5: '5. Service Termination',
            body5:
              'If users violate this agreement, we have the right to terminate their service without assuming any responsibility.',
          },
        },
        PersonalInfoListPage: {
          labels: {
            title: 'Personal Information Collection List',
            accountInfo: 'Account Information',
            deviceInfo: 'Device Information',
            voiceprintInfo: 'Voiceprint Information',
            usageInfo: 'Usage Information',
            purpose: 'Purpose',
          },
        },
      },
      // ===== Batch 1: Chat history =====
      chat: {
        ChatHistoryPage: {
          labels: {
            title: 'Chat History',
            searchPlaceholder: 'Search chat history',
            empty: 'No chat history',
            comingSoon: 'Chat history coming soon',
          },
        },
        MuteSettingsPage: {
          labels: {
            title: 'Mute Settings',
            muteMode: 'Mute Mode',
            muteModeDesc: 'When enabled, Lebao will not speak proactively',
            muteNotifications: 'Mute Notifications',
            muteNotificationsDesc: 'Receive message notifications while muted',
            autoMute: 'Scheduled Mute',
            autoMuteDesc: 'Set automatic mute time period',
            startTime: 'Start Time',
            endTime: 'End Time',
            enabled: 'Enabled',
            disabled: 'Disabled',
            tip: 'When mute mode is enabled, Lebao will not speak proactively, but you can still wake it up anytime.',
          },
          notifications: {
            muteEnabled: 'Mute mode enabled',
            muteDisabled: 'Mute mode disabled',
            notificationsEnabled: 'Mute notifications enabled',
            notificationsDisabled: 'Mute notifications disabled',
            autoMuteEnabled: 'Scheduled mute enabled',
            autoMuteDisabled: 'Scheduled mute disabled',
          },
        },
        VoiceCallPage: {
          labels: {
            title: 'Voice Call',
            connecting: 'Connecting...',
            connected: 'Connected',
            calling: 'Calling...',
            callingDesc: 'Please approach the Lebao device',
            inCall: 'In Call',
            duration: 'Call Duration',
            hangup: 'Hang Up',
            retry: 'Retry',
            speaker: 'Speaker',
            mute: 'Mute',
            endCall: 'End Call',
            // Design 64d5ecc8 raw JSON
            startSpeaking: "You can start speaking", // raw: "你可以开始说话"
            aiGenerated: 'Content generated by AI', // raw: "内容由AI生成"
            comingSoon: 'Voice call coming soon',
          },
          notifications: {
            callConnected: 'Call connected',
            callEnded: 'Call ended',
            callFailed: 'Failed to connect call',
            deviceNotFound: 'No available Lebao device found',
          },
        },
      },
      // ===== Batch 2: Device config sub-pages =====
      'device-config': {
        WifiPage: {
          labels: {
            title: 'Wi-Fi Management',
            connected: 'Connected',
            notConnected: 'Not Connected',
            availableNetworks: 'Available Networks',
            scanNetworks: 'Scan Networks',
            passwordPlaceholder: 'Enter Wi-Fi password',
            connect: 'Connect',
            cancel: 'Cancel',
            scanning: 'Scanning...',
            noNetworks: 'No networks found',
          },
          notifications: {
            connectSuccess: 'Wi-Fi connected successfully',
            connectFailed: 'Failed to connect to Wi-Fi',
          },
        },
        FirmwareUpdatePage: {
          labels: {
            title: 'Firmware Update',
            currentVersion: 'Current Version',
            latestVersion: 'Latest Version',
            checkUpdate: 'Check for Updates',
            updating: 'Updating...',
            upToDate: 'Already up to date',
            updateAvailable: 'Update available',
          },
          notifications: {
            checkFailed: 'Failed to check for updates',
            updateSuccess: 'Update successful',
            updateFailed: 'Update failed',
          },
        },
        AboutDevicePage: {
          labels: {
            title: 'About This Device',
            serialNumber: 'Serial Number',
            model: 'Model',
            firmwareVersion: 'Firmware Version',
            macAddress: 'MAC Address',
            manufactureDate: 'Manufacture Date',
            hardwareVersion: 'Hardware Version',
          },
        },
      },
      // ===== Batch 3: Help & messages =====
      help: {
        FaqPage: {
          labels: {
            title: 'FAQ',
          },
          categories: {
            usage: 'Usage Guide',
            account: 'Account',
            device: 'Device Issues',
            other: 'Other',
          },
          items: {
            q1: 'How to connect LeBot?',
            a1: 'Go to the device list and tap add device, then follow the instructions.',
            q2: 'How to change password?',
            a2: 'Go to Profile and tap Change Password.',
            q3: 'What if LeBot cannot connect to the network?',
            a3: 'Check if Wi-Fi is available, restart the device and try again.',
            q4: 'How to add family members?',
            a4: 'Go to Family Groups and tap Invite Member.',
          },
        },
        FeedbackPage: {
          labels: {
            title: 'Feedback',
            contentPlaceholder: 'Describe your question or suggestion...',
            contactPlaceholder: 'Contact info (optional)',
            uploadImage: 'Upload Image',
            submit: 'Submit',
          },
          notifications: {
            submitSuccess: 'Submitted successfully. Thank you!',
            submitFailed: 'Failed to submit, please try again later',
            contentRequired: 'Please enter your feedback',
          },
        },
      },
      messages: {
        MessageDetailPage: {
          labels: {
            title: 'Message Detail',
          },
        },
        ActivityMessagesPage: {
          labels: {
            title: 'Activity Messages',
            empty: 'No activity messages',
            viewDetail: 'View details',
          },
          items: {
            a1Title: 'Member Day - Limited Time Offer',
            a2Title: 'Member Day - Limited Time Offer',
            a3Title: 'Member Day - Limited Time Offer',
          },
        },
      },
      // ===== Batch 5: Onboarding =====
      OnboardingCompletePage: {
        labels: {
          title: 'Setup Complete!',
          subtitle: "What would you like to do next?",
          footerHint: 'You can also do this later in "Family Group"',
        },
        options: {
          addDevice: {
            title: 'Add Virtual LeBot',
            description: 'Create a dedicated intelligent companion for your child',
          },
          scanJoin: {
            title: 'Scan to Join Family Group',
            description: 'Join an existing family group via invitation code',
          },
        },
        notifications: {
          scanComingSoon: 'Scan feature coming soon',
        },
      },
      OnboardingGuidePage: {
        labels: {
          skip: 'Skip',
          next: 'Next',
          start: 'Get Started',
        },
        steps: {
          step1Title: 'Welcome to LeBot',
          step1Desc: 'Your intelligent pet companion for happy growth',
          step2Title: 'Voice Chat',
          step2Desc: 'Press and hold to talk, start fun conversations with LeBot',
          step3Title: 'Growth Tracking',
          step3Desc: "Track your child's growth data and interaction",
          step4Title: 'Personalization',
          step4Desc: "Customize LeBot's voice style and personality",
        },
      },
    },
  },
};
