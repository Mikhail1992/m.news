import { Container } from 'inversify';
import 'reflect-metadata';

import { IConfigService } from '../../config/config.service.interface';
import { TYPES } from '../../constants/constants';
import { IUserRepository } from '../user.repository.interface';
import { IUserService } from '../user.service.interface';
import { UserService } from '../user.service';

const MockConfigService: IConfigService = {
  get: jest.fn(),
};

const MockRepository: IUserRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
  updatePassword: jest.fn(),
  create: jest.fn(),
};

let repository: IUserRepository;
let userService: IUserService;
const password = '555555';

beforeAll(() => {
  const container = new Container();
  container.bind<IConfigService>(TYPES.IConfigService).toConstantValue(MockConfigService);
  container.bind<IUserRepository>(TYPES.IUserRepository).toConstantValue(MockRepository);
  container.bind<IUserService>(TYPES.IUserService).to(UserService);

  repository = container.get(TYPES.IUserRepository);
  userService = container.get(TYPES.IUserService);
});

describe('UserService', () => {
  test('should create user', async () => {
    repository.create = jest.fn().mockImplementationOnce((x) => ({
      email: x.email,
      password: x.password,
      id: 1,
    }));

    const createdUser = await userService.create({
      email: 'test@test.com',
      password,
    });

    expect(createdUser).not.toBeNull();
    expect(createdUser?.email).toEqual('test@test.com');
    expect(createdUser?.id).toEqual(1);
    expect(createdUser?.password).toEqual(password);
  });
});
