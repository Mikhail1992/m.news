import { Prisma, Role } from '@prisma/client';
import { Container, ContainerModule, inject, injectable, interfaces } from 'inversify';
import 'reflect-metadata';
import { IAuthService } from '../src/auth/auth.service.interface';
import { ILogger } from '../src/common/logger/logger.interface';
import { DatabaseService } from '../src/database/database.service';
import { TYPES } from '../src/constants/constants';
import { LoggerService } from '../src/common/logger/logger.service';
import { AuthService } from '../src/auth/auth.service';
import { IUserService } from '../src/user/user.service.interface';
import { UserService } from '../src/user/user.service';
import { IUserRepository } from '../src/user/user.repository.interface';
import { UserRepository } from '../src/user/user.repository';
import { IConfigService } from '../src/config/config.service.interface';
import { ConfigService } from '../src/config/config.service';
import { userData } from './data/user';
import { categoryData } from './data/category';

@injectable()
class Seed {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.DatabaseService) private databaseService: DatabaseService,
    @inject(TYPES.IAuthService) private authService: IAuthService,
  ) {}

  public async uploadData() {
    this.loggerService.log(`Start seeding ...`);

    for (const c of categoryData) {
      try {
        const category = await this.databaseService.client.category.create({
          data: c,
        });
        this.loggerService.log(`Created category with id: ${category.id}`);
      } catch (e) {
        this.loggerService.log(`Category is already exists`);
      }
    }

    for (const u of userData) {
      try {
        const hashedPassword = await this.authService.generatePassword(u.password);
        const user = await this.databaseService.client.user.create({
          data: { ...u, password: hashedPassword },
        });
        this.loggerService.log(`Created user with id: ${user.id}`);
      } catch (e) {
        this.loggerService.log(`User is already exists`);
      }
    }

    this.loggerService.log(`Seeding finished.`);
  }

  public async init(): Promise<void> {
    await this.uploadData();
    this.databaseService.disconnect();
  }
}
export { Seed };

export const seedBinging = new ContainerModule((bind: interfaces.Bind) => {
  bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
  bind<IAuthService>(TYPES.IAuthService).to(AuthService).inSingletonScope();
  bind<DatabaseService>(TYPES.DatabaseService).to(DatabaseService).inSingletonScope();
  bind<IUserService>(TYPES.IUserService).to(UserService).inSingletonScope();
  bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository).inSingletonScope();
  bind<IConfigService>(TYPES.IConfigService).to(ConfigService).inSingletonScope();
  bind<Seed>(TYPES.ISeed).to(Seed);
});

const seedContainer = new Container();
seedContainer.load(seedBinging);
const seed = seedContainer.get<Seed>(TYPES.ISeed);
seed.init();
