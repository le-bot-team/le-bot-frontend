export type ChallengeResponse = {
  success: false;
  message: string;
} | {
  success: true;
}

export type CodeResponse = {
  success: false;
  message: string;
} | {
  success: true;
  data: {
    accessToken: string;
    isNew: boolean;
    noPassword: boolean;
  };
}

export type PasswordResponse = {
  success: false;
  message: string;
} | {
  success: true;
  data: {
    accessToken: string;
  };
}
