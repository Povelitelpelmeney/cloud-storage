interface User {
  type: string;
  accessToken: string;
  refreshToken: string;
  id: number;
  username: string;
  email: string;
}

type LoginRequest = {
  username: string;
  password: string;
};

type SignupRequest = {
  username: string;
  email: string;
  password: string;
};

type RefreshTokenResponse = {
  type: string;
  accessToken: string;
  refreshToken: string;
};

type FileType = {
  id: number;
  name: string;
  type: string;
  lastModified: number;
  size: number;
};

type APIError = {
  timestamp: string;
  status: number;
  error: string;
  trace: string;
  message: string;
  path: string;
};

type TypeDiff<T, U> = Pick<T, Exclude<keyof T, keyof U>>;
