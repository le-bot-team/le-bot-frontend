export default {
  components: {
    AudioRecorder: {
      labels: {
        error: 'Error',
        hint: 'Hold down to record',
        recording: 'Recording...',
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
        userId: 'User ID',
        connect: 'Connect',
        disconnect: 'Disconnect',
        processing: 'Processing...',
        noUnfinishedMessage: 'No unfinished message',
      },
    },
  },
};
