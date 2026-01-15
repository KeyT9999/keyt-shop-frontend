export interface ChatGptAccount {
  _id: string;
  chatgptEmail: string;
  secretKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface OtpResponse {
  otp: string;
  chatgptEmail: string;
}

