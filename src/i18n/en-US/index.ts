export default {
  components: {
    AudioRecorder: {
      labels: {
        error: 'Error',
        hint: 'Tap to record',
        recording: 'Recording, tab to stop',
      }
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
        accessToken: 'Coze Access Token',
        botId: 'Coze Bot ID',
        userId: 'User ID',
        connect: 'Connect',
        disconnect: 'Disconnect',
        processing: 'Processing...',
        noUnfinishedMessage: 'No unfinished message',
      },
    },
  },
};
