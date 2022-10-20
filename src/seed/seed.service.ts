import { inject, injectable } from 'inversify';
import { IAuthService } from '../auth/auth.service.interface';
import { ILogger } from '../common/logger/logger.interface';
import { TYPES } from '../constants/constants';
import { DatabaseService } from '../database/database.service';
import { categoryData } from './data/category';
import { userData } from './data/user';

@injectable()
class SeedService {
  constructor(
    @inject(TYPES.DatabaseService) private databaseService: DatabaseService,
    @inject(TYPES.IAuthService) private authService: IAuthService,
    @inject(TYPES.ILogger) private loggerService: ILogger,
  ) {}

  async fill(): Promise<void> {
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
        this.loggerService.log(`Created user with id`);
      } catch (e) {
        this.loggerService.log(`User is already exists`);
      }
    }

    this.loggerService.log(`Seeding finished.`);
  }
}

export { SeedService };
