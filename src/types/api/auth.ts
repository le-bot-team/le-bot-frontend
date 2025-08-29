export type ChallengeResponse = {
  success: false;
  message: string;
} | {
  success: true;
}

export type AuthResponse = {
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
