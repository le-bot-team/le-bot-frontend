export default {
  components: {
    auth: {
      FinishPanel: {
        labels: {
          welcome: '欢迎回来，{username}！\n您已成功登录。',
          welcomeNew: '欢迎，{username}！\n您的账号已创建成功。',
          setupFailed: '出现了一些问题。\n请重新尝试登录 / 注册。',
          settingUp: '正在为您准备...',
          redirect: '正在返回上一页...',
          startOver: '重新开始',
        },
      },
      NewPasswordPanel: {
        errors: {
          passwordTooShort: '密码至少 8 位',
          passwordMismatch: '两次输入的密码不一致',
        },
        labels: {
          welcome:
            '欢迎回来，{username}！\n' +
            '我们注意到您当前没有设置密码。\n' +
            '请设置密码以获得更好的体验。',
          welcomeNew: '欢迎，{username}！\n请设置您的密码以继续。',
          newPassword: '新密码',
          confirmNewPassword: '确认新密码',
          sending: '发送中...',
          sendCode: '发送验证码',
          resendCode: '重新发送',
          resendCodeCooldown: '重新发送({seconds}s)',
          strengthWeak: '弱',
          strengthMedium: '中',
          strengthStrong: '强',
          codePlaceholder: '请输入验证码',
          newPasswordPlaceholder: '请设置密码',
          confirmPasswordPlaceholder: '请再次输入设置的密码',
          processing: '处理中...',
          completeRegistration: '完成注册并登录',
        },
        notifications: {
          invalidEmail: '邮箱地址无效',
          passwordResetSuccess: '密码重置成功',
          loginSuccess: '登录成功',
          unknownError: '未知错误',
          sendCodeFailed: '验证码发送失败',
          setPasswordFailed: '设置密码失败',
          autoLoginFailed: '自动登录失败',
        },
      },
      PasswordInput: {
        errors: {
          invalidPassword: '密码无效',
        },
        labels: {
          title: '密码',
        },
      },
      SetupProfilePanel: {
        labels: {
          welcome:
            '欢迎，{username}！\n' +
            '请设置您的个人资料以继续。\n' +
            '您也可以跳过此步骤，稍后在设置中修改。',
          avatar: '头像',
          uploadAvatar: '上传\n头像',
          nickname: '昵称',
          bio: '个人简介',
          confirm: '确认',
          processing: '处理中...',
          nicknamePlaceholder: '请输入昵称',
          birthday: '生日',
          relationship: '您与孩子的关系',
          selectRelationship: '选择关系',
          selectPlaceholder: '请选择',
          relations: {
            mother: '妈妈',
            father: '爸爸',
            grandma: '奶奶',
            grandpa: '爷爷',
            maternalGrandma: '外婆',
            maternalGrandpa: '外公',
            friend: '朋友',
            otherRelative: '其他亲属',
          },
        },
        notifications: {
          unknownError: '未知错误',
          saveFailed: '保存失败',
          fetchFailed: '获取资料失败',
        },
      },
      SignInOrSignUpPanel: {
        labels: {
          email: '邮箱',
          continue: '继续',
          signingIn: '处理中...',
          termsPrefix: '我已阅读并同意',
          termsOfService: '《服务条款》',
          termsSeparator: '、',
          userAgreement: '《用户协议》',
          termsAnd: '和',
          privacyPolicy: '《隐私政策》',
        },
        errors: {
          invalidEmail: '邮箱地址无效',
        },
        notifications: {
          unknownError: '未知错误',
          networkError: '网络连接失败，请检查网络后重试',
        },
      },
      SignInPanel: {
        labels: {
          signIn: '登录',
          signingIn: '登录中...',
          passwordPlaceholder: '请输入密码',
          usePassword: '密码登录',
          useCode: '验证码登录',
          sendCode: '发送验证码',
          sending: '发送中...',
          resendCode: '重新发送',
          resendCodeCooldown: '重新发送({seconds}s)',
          codePlaceholder: '请输入验证码',
        },
        notifications: {
          unknownError: '未知错误',
          networkError: '网络连接失败，请检查网络后重试',
          sendCodeFailed: '验证码发送失败',
          codeSent: '验证码已发送',
        },
      },
      VerificationCodeInput: {
        errors: {
          invalidCode: '验证码无效',
        },
        labels: {
          title: '验证码',
          sendCode: '发送验证码',
          sending: '发送中...',
          resendCode: '重新发送',
          resendCodeCooldown: '重新发送 ({seconds}s)',
          codePlaceholder: '请输入验证码',
        },
        notifications: {
          sendCodeError: '发送验证码出错',
          sendCodeFailed: '发送验证码失败',
          sendCodeSuccess: '验证码发送成功',
        },
      },
    },
    growthData: {
      OverviewCard: {
        labels: {
          accompanyTime: '乐宝已陪伴你{hours}小时',
          guest: '访客',
          male: '男孩',
          female: '女孩',
          age: '{age}岁',
          unknown: '未知',
          weeklyInteract: '本周互动时长',
          bestCapability: '最佳能力',
          hotTopic: '高频话题',
          hours: '{hours} 小时',
          hoursUnit: '小时',
          hoursValue: '{hours}小时',
        },
      },
    },
    chat: {
      ChatMessageItem: {
        labels: {
          typing: '正在输入',
          playAudio: '播放语音',
          stopAudio: '停止播放',
        },
      },
    },
    home: {
      DeviceCard: {
        labels: {
          noDevice: '暂无设备连接',
          addNewDevice: '添加设备',
          defaultName: '我的乐宝',
        },
      },
      TopicCard: {
        labels: {
          title: '话题',
          chatHistory: '聊天记录',
        },
      },
    },
    me: {
      ProfileCard: {
        labels: {
          signInOrSignUp: '登录 / 注册',
          idAccount: 'ID账号 {id}',
        },
      },
    },
    navigations: {
      main: {
        home: '首页',
        devices: '设备',
        growth: '成长',
        mall: '商城',
        me: '我的',
      },
      stack: {
        about: '关于我们',
        auth: '登录',
        chat: '语音聊天',
        deviceConfig: '设备配置',
        devices: '我的设备',
        profile: '个人资料',
        profileEdit: '编辑资料',
        profileChangePassword: '修改密码',
        profileChangePhone: '更换手机号',
        settings: '设置',
        settingsVoiceprint: '声纹设置',
        settingsVoiceprintDetail: '声纹设置',
        settingsVoiceprintNew: '添加声纹',
        settingsVoiceprintTest: '声纹测试',
        chatVoiceCall: '语音通话',
        chatHistory: '聊天记录',
        chatMuteSettings: '静音设置',
        deviceConfigVoice: '语音风格',
        deviceConfigLanguage: '多语言',
        deviceConfigPersonality: 'AI个性调节',
        deviceConfigPersonalityDetail: 'AI个性调节',
        familyGroups: '家庭组',
        familyGroupDetail: '家庭组',
        familyGroupMember: '成员信息',
        familyGroupInvite: '邀请成员',
        familyGroupChildEdit: '修改儿童信息',
        familyGroupCreate: '创建家庭组',
        familyGroupJoin: '加入家庭组',
        messages: '消息',
        messageDetail: '消息详情',
        messagesActivity: '活动消息',
        orders: '我的订单',
        help: '帮助与反馈',
        helpFaq: '常见问题',
        helpFeedback: '意见反馈',
        growthData: '成长数据',
        growthDataCapabilityDetail: '能力详情',
        growthDataWeeklyReport: '周报',
        deviceConfigWifi: 'Wi-Fi 管理',
        deviceConfigUpdate: '固件升级',
        deviceConfigAbout: '关于本设备',
        settingsAddresses: '收货地址',
        settingsAppLanguage: '多语言/Language',
        settingsNotifications: '消息设置',
        settingsGeneral: '通用设置',
        settingsPrivacy: '隐私设置',
        settingsPermissions: '权限管理',
        settingsWordFilter: '敏感词过滤',
        settingsClearCache: '清理缓存',
        settingsNetwork: '网络检测',
        settingsStorage: '存储空间',
        settingsPrivacyPolicy: '隐私政策',
        settingsTermsOfService: '服务条款',
        settingsUserAgreement: '用户协议',
        settingsInfoList: '个人信息收集清单',
        addVirtualDevice: '添加虚拟乐宝',
        onboarding: '引导页',
      },
    },
    settings: {
      voiceprint: {
        DeletePersonDialog: {
          labels: {
            title: '删除人员',
            deletePrompt: '确定要删除"{personName}"及其所有声纹吗？',
            deleteWarning: '此操作不可撤销。如需再次添加，该人员需要重新注册。',
            cancel: '取消',
            confirm: '确认',
          },
          notifications: {
            deleteSuccess: '人员删除成功',
            deleteFailed: '删除人员失败',
            deleteError: '删除人员出错',
          },
        },
        DeleteVoiceDialog: {
          labels: {
            title: '删除声纹',
            deletePrompt: '确定要删除"{personName}"的这条声纹吗？',
            deleteWarning: '此操作不可撤销，您将永久丢失该声纹。',
            cancel: '取消',
            confirm: '确认',
          },
          notifications: {
            deleteSuccess: '声纹删除成功',
            deleteFailed: '删除声纹失败',
            deleteError: '删除声纹出错',
          },
        },
        RecordPanel: {
          labels: {
            preparation: '录制准备',
            quietEnvironment: '环境安静',
            quietEnvironmentDescription: '在无噪音、无回音的室内进行，确保录音清晰。',
            naturalVoice: '声音自然',
            naturalVoiceDescription: '用您平时说话的语速、语调和音量朗读，不要刻意模仿或改变声音。',
            moderateDistance: '距离适中',
            moderateDistanceDescription: '嘴巴与麦克风保持约一拳的距离，避免喷麦或声音过小。',
            readAloudPhrases: '朗读短语',
            readAloudPhrasesDescription: '可爱的乐宝是我的好朋友。',
            startRecording: '准备去录制',
            stopRecording: '停止录制',
            rerecord: '重新录制',
            finish: '完成录制并提交',
          },
          notifications: {
            recordingFailed: '录音启动失败，请检查麦克风权限。',
          },
        },
        SubmitPanel: {
          labels: {
            hint: '请确保您的录音清晰可辨，如不满意可返回重新录制。',
            whoseVoice: '这是谁的声音？',
            whoseVoiceHint: '请输入声音主人的称呼',
            relationship: '与您的关系',
            relationshipHint: '请选择与声音所属人员的关系',
            relationshipLabel: '与孩子的关系',
            selectRelationship: '请选择与孩子的关系',
            confirm: '确认提交',
            previous: '返回',
          },
          notifications: {
            registrationSuccess: '声纹注册成功',
            registrationFailed: '声纹注册失败：{message}',
            registrationError: '声纹注册出错',
          },
        },
      },
    },
    vprRelationships: {
      self: '本人',
      family: '家人',
      friend: '朋友',
      colleague: '同事',
      other: '其他',
    },
    AudioRecorder: {
      labels: {
        error: '出错',
        hint: '点击开始录音',
        recording: '录音中...',
      },
    },
    BirthdayPicker: {
      labels: {
        placeholder: '年/月/日',
        cancel: '取消',
        confirm: '确定',
      },
    },
    CropperDialog: {
      labels: {
        title: '裁剪图片',
        chooseImage: '选择图片',
        noImage: '选择一张图片开始裁剪',
        cancel: '取消',
        confirm: '确认',
      },
      notifications: {
        invalidFile: '文件无效',
        noImageToProcess: '没有可处理的图片',
      },
    },
    ThemeButton: {
      labels: {
        switchTheme: '切换主题',
      },
    },
    'family-group': {
      JoinConfirmDialog: {
        labels: {
          invitesYou: '邀请你加入',
          hintText: '加入后可以查看{childName}与乐宝的聊天记录，并继续对话',
          roleTitle: '选择你在家庭中的身份',
        },
        buttons: {
          cancel: '取消',
          confirm: '确认加入',
          joining: '正在加入...',
        },
        errors: {
          notLoggedIn: '请先登录后再操作',
          joinFailed: '加入家庭组失败',
        },
        notifications: {
          joinSuccess: '已成功加入家庭组！',
        },
      },
    },
    dialogs: {
      ConfirmDialog: {
        labels: {
          cancel: '取消',
          confirm: '确认',
        },
      },
      ShareSheetDialog: {
        labels: {
          title: '分享至',
          wechat: '微信',
          copyLink: '复制链接',
          saveQrCode: '保存二维码',
          cancel: '取消',
        },
        notifications: {
          linkCopied: '链接已复制',
          linkCopyFailed: '复制链接失败',
          qrCodeSaved: '二维码已保存',
          comingSoon: '该功能即将上线',
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
          title: '乐宝',
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
        slogan: '儿童的首个AI伙伴',
        loading: '正在加载...',
      },
    },
    main: {
      AuthPage: {
        labels: {
          title: '乐宝',
          description: '儿童的首个AI伙伴',
          profileSetupTitle: '完善个人信息',
          goBack: '返回',
          finishing: '正在准备您的账户...',
        },
      },
      HomePage: {
        labels: {
          robotName: '小新的乐宝',
          companionDays: '已陪伴您{days}天',
          deviceChange: '切换设备',
          robotSettings: '乐宝设置',
          messages: '消息',
          messagesComingSoon: '消息中心建设中~',
          mascotPlaceholder: '乐宝',
          bubbleLine1: '你好呀，小新~',
          bubbleLine2: '点击我的脑袋去聊天吧~',
          hotTopicsTitle: '高频话题',
          chatHistory: '聊天记录',
          myDevices: '我的设备',
          tryChatting: '开始聊天',
        },
        topics: {
          draw: '画画',
          ultraman: '奥特曼',
          kitty: '猫咪',
          mom: '妈妈',
          housePlay: '过家家酒',
          toto: '托托',
          sing: '唱歌',
        },
        deviceSwitch: {
          title: '切换设备',
          addDevice: '添加乐宝',
          deviceNameFormat: '{name}的乐宝',
          unnamedDevice: '未命名设备',
        },
        notifications: {},
      },
      MePage: {
        labels: {
          memberCenter: '会员中心',
          memberCenterDescription: '积分兑换',
          serviceCenter: '服务中心',
          serviceCenterDescription: '设备与贴士',
          myOrders: '我的订单',
          sharedDevices: '共享设备',
          familyGroup: '家庭组设置',
          helpAndFeedback: '帮助与反馈',
          aboutUs: '关于我们',
          settings: '设置',
          notifications: '通知',
        },
      },
    },
    stack: {
      AboutPage: {
        labels: {
          title: '关于我们',
          companyDescriptionTitle: '公司简介',
          companyDescription:
            '乐宝是一家致力于打造智能互动陪伴机器人的前沿科技公司。\n' +
            '我们的使命是通过创新的 AI 解决方案，为全球用户带来欢乐、便利与陪伴，提升生活品质。',
        },
      },
      MessagesPage: {
        labels: {
          title: '消息',
          empty: '暂无消息',
          done: '完成',
          deleteConfirm: '确定删除该条消息吗？',
          cancel: '取消',
          confirm: '确定',
          delete: '删除',
        },
        items: {
          m1Title: '新的通知',
          m1Content: '您有一条新的通知，请前往查看',
          m2Title: '情绪不佳',
          m2Content: '监测到长期情绪不佳',
          m3Title: '通知标题',
          m3Content: '这里是通知的内容说明',
          m4Title: '新用户会员已发放',
          m4Content: '可在会员中心查看哦！',
        },
      },
      OrdersPage: {
        labels: {
          title: '我的订单',
          tabAll: '全部',
          tabPending: '待付款',
          tabShip: '待发货',
          tabRecv: '待收货',
          tabAfter: '售后',
          more: '更多',
          repurchase: '再次购买',
          refund: '退款售后',
          review: '评价晒单',
          empty: '暂无订单',
        },
        items: {
          orderName: '乐宝机器人底座配饰2025新款限量',
          variant: '森林款',
        },
      },
      HelpPage: {
        labels: {
          title: '帮助与反馈',
          faq: '常见问题',
          phone: '客服电话',
          phoneValue: '400-900-xxxx',
          email: '邮箱',
          emailValue: 'service@lebo.com',
          wechat: '微信客服',
          feedback: '意见反馈',
          logReport: '问题日志上报',
        },
        notifications: {
          comingSoon: '该功能即将上线',
          copied: '已复制到剪贴板',
          copyFailed: '复制失败，请手动复制',
        },
      },
      ChatPage: {
        labels: {
          pageTitle: '小新的乐宝',
          pressToTalk: '按住说话',
          searchChat: '搜索聊天',
          clearChat: '清空聊天',
          clearChatConfirm: '确定清空当前会话吗？',
          callDevice: '呼叫设备',
          callDeviceConfirm: '确定向乐宝发起语音呼叫吗？',
          emptyHint: '按住下方按钮，和乐宝对话吧',
          connect: '连接',
          disconnect: '断开',
          processing: '处理中...',
          listening: '聆听中...',
          thinking: '思考中...',
          speaking: '乐宝正在说话...',
          active: '对话进行中',
          tapToWake: '点击唤醒',
          wakeWordListening: '正在聆听唤醒词...',
          waitingResponse: '等待回复...',
          clearContext: '清除上下文',
          contextCleared: '上下文已清除',
          toggleMute: '切换静音',
          voiceCall: '语音通话',
          toggleTextMode: '切换文字模式',
        },
        notifications: {
          copiedAccessToken: '访问令牌已复制到剪贴板',
          copyAccessTokenFailed: '复制访问令牌失败',
          notLoggedIn: '您未登录，请先登录',
          notReady: '麦克风尚未就绪，请稍候',
          connectFailed: '连接聊天服务器失败',
          wakeFailed: '开启对话失败',
          searchComingSoon: '搜索功能即将上线',
          muteEnabled: '已关闭自动朗读',
          muteDisabled: '已开启自动朗读',
          muteModeEnabled: '已开启静音模式',
          muteModeDisabled: '已关闭静音模式',
          callComingSoon: '呼叫功能即将上线',
        },
      },
      GrowthDataPage: {
        title: '成长数据中心',
        labels: {
          share: '分享',
          summary: '总结',
          weeklyInteraction: '本周互动时长',
          minutes: '分钟',
          viewReport: '查看报告',
        },
        sections: {
          emotion: '情绪变化',
          interaction: '互动时长',
          capability: '能力发展',
          hotTopics: '高频话题',
        },
        emotions: {
          happy: '开心',
          delighted: '愉悦',
          calm: '平静',
          worried: '担忧',
          sad: '难过',
        },
        capabilities: {
          socialUnderstanding: '社交理解力',
          knowledgeIntegration: '知识整合度',
          imagination: '创造想象力',
          emotionalExpression: '语言表达力',
          logicalThinking: '逻辑思维力',
        },
        hotTopics: {
          draw: '画画',
          playhouse: '过家家',
          ultraman: '奥特曼',
          plantsVsZombies: '植物大战僵尸',
          other: '其他',
        },
        mock: {
          dateRange: '2025.5.12~2025.5.18',
          bestCapability: '社交理解力',
          hotTopic: '过家家',
          emotionSummary: '近期情绪状态都很好哦，继续保持~',
          interactionSummary: '本周互动时长达 276 分钟，相比上周有所提升，继续保持~',
          capabilitySummary:
            '知识拓展：通过绘本或科学实验引导其关注现实世界的物理现象，平衡幻想与现实认知。乐宝后续将从知识整合等方向跟儿童进行聊天，引导儿童完成能力的提升。',
          hotTopicsSummary:
            '本周高频话题为"过家家"，占 37%。建议多引导进行创意角色扮演，丰富想象空间。',
        },
      },
      'growth-data': {
        ChatWeeklyReportPage: {
          title: '聊天周报',
          sections: {
            hotTopics: '高频话题',
            weeklyStory: '一周成长小故事',
            interests: '兴趣与偏好',
            emotion: '情绪状态',
            lebotRole: '乐宝的角色',
            toParents: '想对爸爸妈妈说',
          },
          hotTopics: {
            draw: '画画',
            playhouse: '过家家',
            ultraman: '奥特曼',
            plantsVsZombies: '植物大战僵尸',
            other: '其他',
          },
          story: {
            title: '想象力、爱心与警察梦',
            body: '亲爱的爸爸妈妈：\n这一周，我们通过语音陪伴记录，看到了一个充满想象力、善良又活泼的绵绵。她带着乐宝一起冒险、救宝宝、抓坏蛋、照顾小猫小丸子，还帮妈妈剥大蒜……在这些看似天马行空的对话中，我们看到了绵绵正在悄悄成长的小小世界。',
          },
          interests: {
            title: '小小故事家与动物守护者',
            growthSignal:
              '成长信号：绵绵正处于象征游戏的高峰期，通过角色扮演和虚构情节，她在学习理解世界、表达情绪、建立道德观念。',
            body: '绵绵喜欢编故事，也喜欢扮演角色。绵绵常常把自己想象成"能跳1300尺高""踩着筋斗云"的小英雄，也会为"被关在盒子里的宝宝"着急，为"被海蛇吞掉的医生"想办法救援。\n喜欢动物：特别是绵绵养的小猫"小丸子"。能细致地描述小丸子的外貌、习惯、甚至它"粉粉的鼻子""黑溜溜的眼睛"。\n对家庭生活充满好奇：比如帮妈妈剥大蒜、关心妈妈被蚊子咬、想象妈妈做饭的细节。\n对"正义"有初步理解：喜欢扮演警察抓坏蛋，关心"坏人会不会被抓到"。',
          },
          emotion: {
            title: '温暖、调皮，偶尔小焦虑',
            growthSignal:
              '成长信号：绵绵正在学习情绪调节与共情。她能通过故事表达担忧，也能在互动中获得安全感。',
            body: '绵绵的情绪丰富而真实：\n温暖贴心：绵绵会提醒机器人"妈妈做饭很辛苦"，也会为"小丸子"擦嘴巴、喂零食。\n调皮幽默：绵绵会开玩笑说"你是个大笨蛋"，也会编造"我被水球困住"的紧张情节，享受互动中的惊喜感。\n偶尔焦虑：当故事中的"宝宝没有呼吸""小丸子跑丢"时，绵绵会表现出着急和担忧，但很快又能通过想象或行动化解情绪。',
          },
          lebotRole: {
            title: '耐心的玩伴与情绪容器',
            growthSignal:
              '乐宝的价值：它成为绵绵可以完全掌控的"玩伴"，让绵绵在安全的关系中练习语言、表达情绪、构建自信。',
            body: '在这段对话中，乐宝不仅是听众，更是绵绵的故事搭档和情绪支持者：\n乐宝陪绵绵一起"救宝宝"、"抓海蛇"、"剥大蒜"，让她的想象力有处安放；\n乐宝在绵绵着急时说"别慌，我们一起想办法"，在她饿肚子时陪她聊天转移注意力；\n乐宝接纳绵绵的玩笑、重复的提问，甚至无厘头的剧情转折，给了绵绵充分的表达自由。',
          },
          toParents: {
            body: '绵绵的对话里，藏着一个善良、有想象力、正在努力理解世界的小小人儿。她的每一个"为什么""然后呢"，都是她在主动构建自己的认知地图。\n而乐宝，就像一个小小的"故事伙伴"，陪绵绵在这个地图上自由探索、不怕迷路。你们平时给绵绵的爱与安全感，正是她敢于想象、敢于表达的根基。\n谢谢你们，让我们有机会见证绵绵这些可爱又宝贵的成长瞬间。',
            signature1: '乐宝 与 绵绵的成长记录员',
            signature2: '2025年8月',
          },
        },
        CapabilityDetailPage: {
          title: '语言表达力',
          sections: {
            overallScore: '综合评分',
            review: '综合评语',
            comparison: '对比分析',
          },
          dimensions: {
            toneProsody: '语音语调',
            sentenceCompleteness: '语句完整性',
            vocabularyRichness: '词汇丰富度',
            fluency: '语言流畅性',
          },
          review: {
            text: '绵绵的语言表达力整体还不错，语句完整性和语言流畅性上有欠缺，但是词汇丰富度高，语音语调生动活泼，日常表达没有问题。',
          },
          comparison: {
            horizontal: '横向对比',
            horizontalSub: '（同年龄儿童发展标准）',
            vertical: '纵向对比',
            verticalSub: '（自身发展轨迹）',
            advantage1:
              '叙事想象力丰富——能自主构建多角色奇幻场景（如"变成水龙裹住地球""与孙悟空互动"），远超5岁儿童平均叙事水平。',
            advantage2:
              '情感传达生动——通过夸张表达（如"臭哪吒""帅气的哪吒"）和语气词（如"哈哈哈"）有效传递情绪。',
            disadvantage1:
              '逻辑衔接较弱——事件切换频繁（如从"拉屎"突然跳至"孙悟空"），因果关联性低。',
            progress1: '主题持续性提升——能围绕"哪吒"主题持续对话超20轮，较前期的专注度明显提高。',
            toDevelop1: '复杂句型使用——未见条件句、转折句等复合结构，多为简单句或并列句。',
          },
          tags: {
            advantage: '优势',
            disadvantage: '不足',
            progress: '进步',
            toDevelop: '待发展',
          },
        },
      },
      DeviceConfigPage: {
        labels: {
          voiceStyle: '音色风格',
          defaultStyle: '默认风格',
          language: '语言',
          personalityAdjustment: 'AI 个性调节',
          wifiManagement: 'Wi-Fi 管理',
          firmwareUpdate: '固件升级',
          aboutThisDevice: '关于本设备',
          unbindDevice: '删除设备',
          deleteConfirmTitle: '确认要删除吗',
          deleteConfirmBody:
            '删除设备的同时，该设备绑定的儿童家庭组、聊天记录、成长报告等都将一并删除，确定删除吗？',
          confirmDelete: '确定',
        },
        notifications: {
          unbindSuccess: '设备删除成功',
          unbindFailed: '删除设备失败',
        },
      },
      DevicesPage: {
        labels: {
          title: '我的设备',
          addVirtualDevice: '添加虚拟乐宝',
          virtualDevice: '虚拟乐宝',
          serialNumber: 'SN：{sn}',
          unbind: '解绑',
          cancel: '取消',
          unbindConfirm: '删除设备的同时，该设备关联的家庭组信息也将一并删除，确定要解绑该设备吗？',
          noVirtualDevices: '暂无虚拟设备。添加一个开始聊天吧！',
          maxDevicesReached: '最多可添加 5 个虚拟设备',
        },
        notifications: {
          activateSuccess: '虚拟乐宝激活成功',
          activateFailed: '激活虚拟设备失败',
          unbindSuccess: '设备解绑成功',
          unbindFailed: '解绑设备失败',
        },
      },
      AddVirtualDevicePage: {
        labels: {
          title: '添加虚拟乐宝',
        },
        step1: {
          questions: {
            gender: '宝宝的性别是？',
            name: '宝宝的名字是？',
            birthday: '宝宝的生日是？',
          },
          labels: {
            male: '男孩',
            female: '女孩',
            next: '下一步',
            deviceNameSuffix: '的乐宝',
            deviceNamePreview: '乐宝名称',
          },
          placeholders: {
            name: '请输入宝宝的名字',
            birthday: '请选择宝宝的生日',
          },
        },
        step2: {
          labels: {
            activating: '正在激活虚拟乐宝...',
            success: '激活成功！',
            retry: '重试',
          },
        },
        step3: {
          labels: {
            skip: '跳过，稍后设置',
          },
        },
        step4: {
          labels: {
            title: 'AI个性调节',
            description: '开启后，乐宝会根据设定的个性特点与宝宝交流',
            enabled: '开启AI个性',
            next: '提交',
            skip: '跳过，使用默认个性',
          },
          questions: {
            traits: '希望乐宝有什么性格特点？',
          },
          placeholders: {
            traits: '例如：温柔、耐心、喜欢讲故事…',
          },
        },
        step5: {
          labels: {
            ready: '虚拟乐宝已就绪！',
            startChat: '开始聊天',
            backToHome: '回到首页',
          },
          familyGroupName: '{name}的家庭组',
        },
        notifications: {
          fieldsRequired: '请完整填写宝宝的名字和生日',
          activateFailed: '激活虚拟设备失败',
          tokenMissing: '登录已过期，请重新登录',
          voiceprintFailed: '声纹注册失败',
          leaveIncomplete: '设备设置尚未完成，离开将产生未配置的设备。确定离开吗？',
        },
      },
      FamilyGroupPage: {
        labels: {
          title: '家庭组设置',
          addFamilyGroup: '添加家庭组',
          emptyState: '暂无家庭组，点击下方按钮创建',
          addFirstDevice: '添加第一个乐宝设备',
          memberCount: '{count} 位成员',
        },
        notifications: {
          comingSoon: '该功能即将上线',
        },
      },
      'family-group': {
        DetailPage: {
          labels: {
            invite: '邀请成员',
            membersTitle: '成员（{count}人）',
            creator: '创建者',
          },
          meta: {
            male: '男',
            female: '女',
            years: '{age}岁',
            yearsUnit: '岁',
            deviceSuffix: '的乐宝',
          },
          role: {
            father: '爸爸',
            mother: '妈妈',
            grandpa: '爷爷',
            grandma: '奶奶',
            paternalGrandmother: '奶奶(祖母)',
            maternalGrandfather: '外公',
            maternalGrandma: '外婆',
            friend: '朋友',
            other: '其他',
          },
        },
        MemberPage: {
          labels: {
            nickname: '称呼',
            gender: '性别',
            roleLabel: '身份',
            birthday: '生日',
            voiceprint: '声纹',
            viewVoiceprint: '查看详情',
            joinedAt: '加入时间：{time}',
            remove: '移除成员',
            deleteMember: '删除成员',
          },
          meta: {
            male: '男',
            female: '女',
          },
          buttons: {
            remove: '移除成员',
          },
          confirm: {
            title: '移除成员',
            message: '确定要将「{name}」从家庭组中移除吗？',
            cancel: '取消',
            ok: '确认移除',
          },
          notifications: {
            removed: '成员已移除',
            removeFailed: '移除失败，请重试',
            deleteSuccess: '成员删除成功',
          },
          errors: {
            removeFailed: '移除失败',
            memberNotFound: '成员信息未找到',
          },
          role: {
            father: '爸爸',
            mother: '妈妈',
            grandpa: '爷爷',
            grandma: '奶奶',
            paternalGrandmother: '奶奶(祖母)',
            maternalGrandfather: '外公',
            maternalGrandma: '外婆',
            friend: '朋友',
            other: '其他',
          },
        },
        InvitePage: {
          labels: {
            scanToJoin: '{childName}的家庭组 — 扫码加入',
            shareTip: '直接分享到微信聊天',
            share: '分享二维码',
            expiry: '有效期剩余 {time}',
          },
          notifications: {
            shareTodo: '分享功能即将上线',
          },
          errors: {
            generateFailed: '生成邀请码失败',
            notLoggedIn: '请先登录',
            groupNotFound: '家庭组不存在或已被删除',
          },
        },
        ChildEditPage: {
          questions: {
            gender: '宝宝的性别是？',
            name: '宝宝的名字是？',
            birthday: '宝宝的生日是？',
          },
          labels: {
            male: '男孩',
            female: '女孩',
            next: '下一步',
            saveAndBack: '保存修改并返回',
            submitChanges: '提交修改',
            skip: '跳过',
          },
          placeholders: {
            name: '请输入宝宝的名字',
            birthday: '请选择宝宝的生日',
          },
          notifications: {
            fieldsRequired: '请完整填写宝宝的名字和生日',
            nameTooLong: '名字不能超过20个字符',
            createSuccess: '家庭组创建成功',
            updateSuccess: '儿童信息更新成功',
            updateFailed: '更新失败，请重试',
          },
        },
      },
      JoinPage: {
        errors: {
          noCode: '缺少邀请码',
          notLoggedIn: '请先登录后再加入家庭组',
          invalidCode: '邀请码无效或已过期',
          resolveFailed: '解析邀请码失败，请重试',
        },
      },
      ProfilePage: {
        labels: {
          nickname: '昵称',
          bio: '个人简介',
          birthday: '生日',
          notSet: '未设置',
          phone: '手机号',
          changePassword: '修改密码',
          idAccount: 'ID账号：{id}',
          bindEmail: '绑定邮箱',
          bindPhone: '绑定手机号',
          removeAccount: '注销账号',
          deactivateTitle: '注销账号',
          deactivateConfirm: '确定要注销账号吗？此操作不可撤销。',
          deactivateConfirmOk: '确认',
        },
        notifications: {
          notLoggedIn: '您未登录',
          deactivateSuccess: '账号注销成功',
          deactivateFailed: '账号注销失败',
        },
      },
      ProfileFieldEditPage: {
        labels: {
          nickname: '昵称',
          bio: '个人简介',
          birthday: '生日',
          save: '保存',
          placeholderNickname: '请输入昵称',
          placeholderBio: '请输入个人简介',
          placeholderBirthday: '请选择生日',
        },
        notifications: {
          saveSuccess: '保存成功',
          saveFailed: '保存失败',
          invalidField: '未知字段',
        },
      },
      ChangePhonePage: {
        labels: {
          title: '修改手机号',
          noPhone: '未绑定手机号',
          codePlaceholder: '请输入验证码',
          sendCode: '发送验证码',
          resend: '重新发送',
          resendCooldown: '重发（{seconds}）',
          sending: '发送中...',
          verifyOld: '验证原手机号',
          verifying: '验证中...',
          newPhonePlaceholder: '请输入新的手机号码',
          submitNew: '提交绑定新的手机号',
          submitting: '提交中...',
        },
        errors: {
          invalidCode: '验证码输入错误',
          verifyFailed: '验证失败',
          submitFailed: '提交失败',
        },
        notifications: {
          codeSent: '验证码已发送',
          sendCodeFailed: '发送验证码失败',
          sendCodeError: '发送验证码出错',
          success: '手机号修改成功',
        },
        hints: {
          phoneFormat: '请输入有效的11位中国大陆手机号码',
        },
      },
      LanguagePage: {
        labels: {
          pageTitle: '多语言',
          comingSoon: '该语言暂未上线',
        },
        languages: {
          chinese: '中文/Chinese',
          english: '英文/English',
          cantonese: '粤语/Cantonese',
        },
      },
      PersonalityPage: {
        labels: {
          toggleLabel: 'AI个性调节',
          tip: '*开启个性调节有助于用户匹配到更适合个人喜好的机器人个性',
        },
      },
      PersonalityDetailPage: {
        labels: {
          toggleLabel: 'AI个性调节',
          tip: '*开启个性调节有助于用户匹配到更适合个人喜好的机器人个性',
          traitsTitle: '请描述您孩子的个性：',
          traitsPlaceholder: '（选填）详细描述孩子的个性特点...',
          goalsTitle: '您希望孩子的发展方向：',
          goalsPlaceholder: '可以输入个性或者能力发展方向...',
          submit: '提交',
          skip: '跳过',
        },
        traitTags: {
          trait_a: '开朗',
          trait_b: '内向',
          trait_c: '活泼',
          trait_d: '敏感',
          trait_e: '专注',
          trait_f: '倔强',
        },
        goalTags: {
          goal_a: '自信',
          goal_b: '专注',
          goal_c: '善良',
          goal_d: '独立',
          goal_e: '坚韧',
          goal_f: '乐观',
        },
      },
      VoiceStylePage: {
        labels: {
          pageTitle: '语音风格',
          currentStyle: '当前语音风格',
          rateLabel: '语速',
          sectionTitle: '可选风格',
        },
        styles: {
          cuteChild: '可爱童声',
          gentleSister: '温柔姐姐',
          sunnyBoy: '阳光少年',
          cuteRobot: '呆萌机器人',
          sweetLady: '甜美女声',
        },
      },
      ChangePasswordPage: {
        labels: {
          title: '修改密码',
          oldPassword: '请输入旧密码',
          newPassword: '请设置密码',
          confirmPassword: '请再次输入设置的密码',
          submit: '提交修改并返回',
          submitting: '提交中...',
          toggleOldPassword: '切换旧密码可见性',
          toggleNewPassword: '切换新密码可见性',
          toggleConfirmPassword: '切换确认密码可见性',
        },
        errors: {
          wrongOldPassword: '原密码错误',
          passwordMismatch: '两次输入的密码不一致',
          passwordTooShort: '密码至少 8 位',
        },
        notifications: {
          success: '密码修改成功',
          failed: '密码修改失败',
          notLoggedIn: '您未登录',
        },
      },
      SettingsPage: {
        labels: {
          profileSettings: '个人资料',
          signInOrSignUp: '登录 / 注册',
          voiceprintSettings: '声纹设置',
          deliveryAddresses: '收货地址',
          languageSettings: '多语言/Language',
          messageSettings: '消息设置',
          generalSettings: '通用设置',
          privacySettings: '隐私设置',
          permissionManagement: '权限管理',
          sensitiveWordFilter: '敏感词过滤',
          clearCache: '清理缓存',
          networkDiagnostics: '网络检测',
          storageSpace: '存储空间',
          appVersion: '关于版本',
          privacyPolicy: '隐私政策',
          termsOfService: '服务条款',
          personalInfoList: '个人信息收集清单',
          icpFilingNumber: '备案号',
          internetICPCode: '{code}',
          logout: '退出登录',
        },
      },
      settings: {
        voiceprint: {
          DetailPage: {
            labels: {
              name: '姓名：{name}',
              id: 'ID：{id}',
              temporary: '临时',
              voiceprints: '声纹',
              vectorLength: '向量长度：{length}',
              noVoiceprints: '暂无已注册声纹。',
              addVoiceprint: '添加声纹',
              deletePerson: '删除人员',
              whoseVoice: '这是谁的声音？',
              relationshipToChild: '与孩子的关系',
              submitUpdate: '提交修改',
              deleteVoiceprint: '删除声纹',
              selectRelationship: '请选择与孩子的关系',
              namePlaceholder: '请输入姓名',
            },
            notifications: {
              fetchPersonDetailFailed: '获取人员详情失败',
              fetchPersonDetailError: '获取人员详情出错',
              updateSuccess: '修改成功',
              updateFailed: '修改失败',
              updateError: '网络错误',
              nameRequired: '姓名不能为空',
            },
          },
          TestPage: {
            labels: {
              hint: '请确保您的录音清晰可辨。',
              finish: '完成测试',
            },
            notifications: {
              recognitionSuccess: '声纹识别成功：{personName}（置信度：{confidence}%）',
              recognitionFailed: '声纹识别失败：{message}',
              recognitionError: '声纹识别出错',
            },
          },
        },
        VoiceprintPage: {
          labels: {
            personVoiceprint: '{name}的声纹',
            addNewPerson: '添加新的声纹',
            testVoice: '测试声纹',
            temporalTag: '临时声纹',
            temporalHint: '临时声纹保存一段时间后会自动清除，点击声纹去保留',
            emptyState: '暂无声纹记录，点击下方按钮添加',
          },
          notifications: {
            fetchFailed: '获取声纹列表失败',
            fetchError: '获取声纹列表时发生错误',
          },
        },
        // ===== Batch 4: Settings sub-pages =====
        AddressesPage: {
          labels: {
            title: '收货地址',
            addAddress: '新增收货地址',
            empty: '暂无收货地址',
            name: '收件人',
            phone: '手机号',
            address: '详细地址',
            setDefault: '设为默认地址',
            delete: '删除',
            edit: '编辑',
            default: '默认',
          },
        },
        AppLanguagePage: {
          labels: {
            title: '多语言/Language',
            current: '当前',
          },
          languages: {
            zhCN: '简体中文',
            enUS: 'English',
          },
        },
        NotificationSettingsPage: {
          labels: {
            title: '消息设置',
            pushNotification: '推送通知',
            chatReminder: '聊天提醒',
            deviceAlert: '设备提醒',
            systemUpdate: '系统更新',
            marketing: '活动推送',
          },
        },
        GeneralSettingsPage: {
          labels: {
            title: '通用设置',
            darkMode: '深色模式',
            autoPlay: '自动播放语音',
            downloadWifiOnly: '仅 Wi-Fi 下载',
          },
        },
        PrivacySettingsPage: {
          labels: {
            title: '隐私设置',
            dataCollection: '数据收集',
            usageAnalysis: '使用分析',
            personalizedAds: '个性化推荐',
          },
        },
        PermissionManagementPage: {
          labels: {
            title: '权限管理',
            microphone: '麦克风',
            camera: '相机',
            storage: '存储',
            location: '位置',
            openSettings: '打开系统设置',
          },
        },
        WordFilterPage: {
          labels: {
            title: '敏感词过滤',
            enable: '启用敏感词过滤',
            addWord: '添加敏感词',
            wordPlaceholder: '请输入敏感词',
            empty: '暂无自定义敏感词',
          },
        },
        ClearCachePage: {
          labels: {
            title: '清理缓存',
            cacheSize: '缓存大小',
            clear: '清理缓存',
            confirmTitle: '清理缓存',
            confirmBody: '确定要清理所有缓存数据吗？',
          },
          notifications: {
            clearSuccess: '缓存清理成功',
            clearFailed: '缓存清理失败',
          },
        },
        NetworkDiagnosticsPage: {
          labels: {
            title: '网络检测',
            startDiagnosis: '开始检测',
            diagnosing: '正在检测...',
            resultGood: '网络连接正常',
            resultBad: '网络连接异常',
            dns: 'DNS 解析',
            tcp: 'TCP 连接',
            ws: 'WebSocket 连接',
          },
        },
        StorageSpacePage: {
          labels: {
            title: '存储空间',
            total: '总空间',
            used: '已使用',
            available: '可用',
            cache: '缓存',
            chatData: '聊天数据',
            other: '其他',
          },
        },
        PrivacyPolicyPage: {
          labels: {
            title: '隐私政策',
            contentUnavailable: '内容暂不可用',
          },
          content: {
            title1: '一、信息收集',
            body1: '我们收集您在使用服务时主动提供的信息，包括账号信息、设备信息和使用数据。',
            title2: '二、信息使用',
            body2: '我们使用收集的信息来提供、维护和改进服务，确保安全并提供个性化体验。',
            title3: '三、信息保护',
            body3: '我们采用行业标准的安全措施保护您的信息，防止未经授权的访问。',
            title4: '四、信息共享',
            body4: '未经您的同意，我们不会与第三方共享您的个人信息，法律法规要求除外。',
          },
        },
        TermsOfServicePage: {
          labels: {
            title: '服务条款',
            contentUnavailable: '内容暂不可用',
          },
          content: {
            title1: '一、接受条款',
            body1: '欢迎使用乐宝 AI 机器人服务。您在使用我们的服务时，须遵守本服务条款的所有条件。',
            title2: '二、服务说明',
            body2:
              '乐宝 AI 机器人为用户提供智能语音对话服务，包括语音识别、自然语言处理和语音合成等功能。',
            title3: '三、用户账号',
            body3:
              '用户需要注册账号才能使用完整功能。用户应妥善保管账号信息，因账号被盗用造成的损失由用户自行承担。',
            title4: '四、使用规范',
            body4:
              '用户不得利用本服务从事违法违规活动，不得传播违法、有害、骚扰性、伤害性、歧视性内容。',
            title5: '五、服务变更',
            body5:
              '我们保留随时修改或中断服务的权利，并会提前通知用户。因服务变更造成的损失，我们不承担责任。',
            title6: '六、争议解决',
            body6: '本条款的解释和执行均适用中华人民共和国法律。如有争议，双方应友好协商解决。',
          },
        },
        UserAgreementPage: {
          labels: {
            title: '用户协议',
            contentUnavailable: '内容暂不可用',
          },
          content: {
            title1: '一、协议范围',
            body1:
              '本协议是用户与乐宝之间关于使用 AI 机器人服务的法律协议。用户使用服务即表示同意本协议的所有条款。',
            title2: '二、用户权利',
            body2: '用户享有正常使用服务的权利，有权享受我们提供的各项功能和服务更新。',
            title3: '三、用户义务',
            body3: '用户需保证所提供信息的真实性和合法性，不得利用服务进行任何非法活动。',
            title4: '四、免责声明',
            body4:
              'AI 机器人提供的回答仅供参考，不构成任何形式的建议。我们不对用户因使用服务造成的任何损失负责。',
            title5: '五、终止服务',
            body5: '如用户违反本协议，我们有权终止其服务而不承担任何责任。',
          },
        },
        PersonalInfoListPage: {
          labels: {
            title: '个人信息收集清单',
            accountInfo: '账号信息',
            deviceInfo: '设备信息',
            voiceprintInfo: '声纹信息',
            usageInfo: '使用信息',
            purpose: '用途',
          },
          purposes: {
            account: '账号管理与服务提供',
            device: '设备连接与功能支持',
            voiceprint: '声纹识别与个性化',
            usage: '服务优化与体验提升',
          },
        },
      },
      // ===== Batch 1: Chat history =====
      chat: {
        ChatHistoryPage: {
          labels: {
            title: '聊天记录',
            searchPlaceholder: '搜索聊天记录',
            empty: '暂无聊天记录',
            comingSoon: '聊天记录功能即将上线',
          },
        },
        MuteSettingsPage: {
          labels: {
            title: '静音设置',
            muteMode: '静音模式',
            muteModeDesc: '开启后，乐宝将不再主动说话',
            muteNotifications: '静音通知',
            muteNotificationsDesc: '静音模式下仍接收消息通知',
            autoMute: '定时静音',
            autoMuteDesc: '设置自动静音时间段',
            startTime: '开始时间',
            endTime: '结束时间',
            enabled: '已开启',
            disabled: '已关闭',
            tip: '开启静音模式后，乐宝将不再主动说话，但您仍可随时唤醒对话。',
          },
          notifications: {
            muteEnabled: '已开启静音模式',
            muteDisabled: '已关闭静音模式',
            notificationsEnabled: '已开启静音通知',
            notificationsDisabled: '已关闭静音通知',
            autoMuteEnabled: '已开启定时静音',
            autoMuteDisabled: '已关闭定时静音',
          },
        },
        VoiceCallPage: {
          labels: {
            title: '语音通话',
            connecting: '正在连接...',
            connected: '已连接',
            calling: '正在呼叫...',
            callingDesc: '请靠近乐宝设备',
            inCall: '通话中',
            duration: '通话时长',
            hangup: '挂断',
            retry: '重试',
            speaker: '扬声器',
            mute: '静音',
            endCall: '结束通话',
            // Design 64d5ecc8 raw JSON
            startSpeaking: '你可以开始说话', // raw: "你可以开始说话" 15px/22px #151717 at y=718
            aiGenerated: '内容由AI生成', // raw: "内容由AI生成" 12px/16px opacity-50 at y=748
            comingSoon: '语音通话功能即将上线',
          },
          notifications: {
            callConnected: '通话已连接',
            callEnded: '通话已结束',
            callFailed: '通话连接失败',
            deviceNotFound: '未找到可用的乐宝设备',
          },
        },
      },
      // ===== Batch 2: Device config sub-pages =====
      'device-config': {
        WifiPage: {
          labels: {
            title: 'Wi-Fi 管理',
            connected: '已连接',
            notConnected: '未连接',
            availableNetworks: '可用网络',
            scanNetworks: '扫描网络',
            passwordPlaceholder: '请输入 Wi-Fi 密码',
            connect: '连接',
            cancel: '取消',
            scanning: '正在扫描...',
            noNetworks: '未找到可用网络',
          },
          notifications: {
            connectSuccess: 'Wi-Fi 连接成功',
            connectFailed: 'Wi-Fi 连接失败',
          },
        },
        FirmwareUpdatePage: {
          labels: {
            title: '固件升级',
            currentVersion: '当前版本',
            latestVersion: '最新版本',
            checkUpdate: '检查更新',
            updating: '正在更新...',
            upToDate: '已是最新版本',
            updateAvailable: '有新版本可用',
          },
          notifications: {
            checkFailed: '检查更新失败',
            updateSuccess: '更新成功',
            updateFailed: '更新失败',
          },
        },
        AboutDevicePage: {
          labels: {
            title: '关于本设备',
            serialNumber: '序列号',
            model: '型号',
            firmwareVersion: '固件版本',
            macAddress: 'MAC 地址',
            manufactureDate: '出厂日期',
            hardwareVersion: '硬件版本',
          },
        },
      },
      // ===== Batch 3: Help & messages =====
      help: {
        FaqPage: {
          labels: {
            title: '常见问题',
          },
          categories: {
            usage: '使用指南',
            account: '账号相关',
            device: '设备问题',
            other: '其他',
          },
          items: {
            q1: '如何连接乐宝？',
            a1: '请在设备列表页点击添加设备，按照指引完成连接。',
            q2: '如何修改密码？',
            a2: '请在个人资料页点击修改密码。',
            q3: '乐宝无法连接网络怎么办？',
            a3: '请检查 Wi-Fi 是否可用，重启设备后重试。',
            q4: '如何添加家庭成员？',
            a4: '请在家庭组页面点击邀请成员。',
          },
        },
        FeedbackPage: {
          labels: {
            title: '意见反馈',
            contentPlaceholder: '请描述您的问题或建议...',
            contactPlaceholder: '联系方式（选填）',
            uploadImage: '上传图片',
            submit: '提交',
          },
          notifications: {
            submitSuccess: '提交成功，感谢您的反馈！',
            submitFailed: '提交失败，请稍后重试',
            contentRequired: '请输入反馈内容',
          },
        },
      },
      messages: {
        MessageDetailPage: {
          labels: {
            title: '消息详情',
            noContent: '暂无内容',
          },
          items: {
            m1Title: '新的通知',
            m1Content: '您有一条新的通知，请前往查看。这条通知是关于您设备更新的提醒，请及时查看。',
            m2Title: '情绪不佳',
            m2Content: '监测到长期情绪不佳，建议与乐宝进行更多互动以改善心情。',
            m3Title: '通知标题',
            m3Content: '这里是通知的内容说明，详细描述了通知的具体事项。',
            m4Title: '新用户会员已发放',
            m4Content: '可在会员中心查看哦！欢迎加入乐宝大家庭。',
          },
        },
        ActivityMessagesPage: {
          labels: {
            title: '活动消息',
            empty: '暂无活动消息',
            viewDetail: '查看详情',
            comingSoon: '活动详情即将上线',
          },
          items: {
            a1Title: '会员日，优惠限今日',
            a2Title: '会员日，优惠限今日',
            a3Title: '会员日，优惠限今日',
          },
        },
      },
      // ===== Batch 5: Onboarding =====
      OnboardingGuidePage: {
        labels: {
          skip: '跳过',
          next: '下一步',
          start: '开始使用',
        },
        steps: {
          step1Title: '欢迎来到乐宝',
          step1Desc: '您的智能宠物伙伴，陪伴孩子快乐成长',
          step2Title: '语音对话',
          step2Desc: '按住说话，与乐宝开启有趣对话',
          step3Title: '成长记录',
          step3Desc: '追踪孩子的成长数据，了解互动情况',
          step4Title: '个性设置',
          step4Desc: '自定义乐宝的语音风格和个性',
        },
      },
      OnboardingCompletePage: {
        labels: {
          title: '设置完成！',
          subtitle: '接下来你想做什么？',
          footerHint: '也可以稍后在「家庭组」中操作',
        },
        options: {
          addDevice: {
            title: '添加虚拟乐宝',
            description: '为您的孩子创建一个专属的智能陪伴伙伴',
          },
          scanJoin: {
            title: '扫码加入家庭组',
            description: '通过邀请码加入已有家庭成员的家庭组',
          },
        },
        notifications: {
          scanComingSoon: '扫码功能即将上线',
        },
      },
    },
  },
};
