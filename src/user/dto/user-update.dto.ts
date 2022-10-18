import { Role, User } from '@prisma/client';
import { IsDefined, IsEnum } from 'class-validator';

export class UserUpdateDto implements Pick<User, 'role'> {
  @IsDefined()
  @IsEnum(Role)
  role: Role;
}
