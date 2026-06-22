export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
}

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  avatar: string;
}
