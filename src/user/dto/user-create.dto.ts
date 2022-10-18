import { User } from '@prisma/client';
import { IsDefined, IsEmail, MinLength } from 'class-validator';

export class UserCreateDto implements Pick<User, 'email' | 'password'> {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @MinLength(8)
  password: string;
}
