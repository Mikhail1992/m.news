import { User } from '@prisma/client';

export default class UserDTO implements Partial<User> {
  public id: User['id'];
  public name: User['name'];
  public email: User['email'];
  public role: User['role'];

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
  }
}
