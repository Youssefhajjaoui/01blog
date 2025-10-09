export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
  subscribers: number;
  posts: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRegistrationDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserLoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  user: User;
  expiresIn: number;
}
