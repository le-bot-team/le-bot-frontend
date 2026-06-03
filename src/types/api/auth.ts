export type ChallengeResponse = {
  success: false;
  message: string;
} | {
  success: true;
}

export type EmailCheckResponse = {
  success: false;
  message: string;
} | {
  success: true;
  data: { isNew: boolean };
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

export type LegalDocumentSection = {
  title: string;
  body: string;
}

export type LegalDocumentResponse = {
  success: false;
  message: string;
} | {
  success: true;
  data: {
    title: string;
    sections: LegalDocumentSection[];
  };
}
