export interface CreateUserDto {
  firstName: string;
  lastName: string;
  age: number;
  username: string;
  password: string;
}

export interface LoginUserDto {
  username: string;
  password: string;
}