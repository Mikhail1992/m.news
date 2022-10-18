import { User } from '@prisma/client';
import { IsDefined, IsEmail } from 'class-validator';

export class ForgotPasswordDto implements Pick<User, 'email'> {
  @IsDefined()
  @IsEmail()
  email: string;
}
