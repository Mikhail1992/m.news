import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { ILogger } from '../common/logger/logger.interface';

import { TYPES } from '../constants/constants';

@injectable()
class DatabaseService {
  client: PrismaClient;
  constructor(@inject(TYPES.ILogger) private loggerService: ILogger) {
    this.client = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'minimal',
    });
  }

  async connect(): Promise<void> {
    try {
      this.client.$connect();
      this.loggerService.log('Successful database connection');
    } catch (err) {
      if (err instanceof Error) {
        this.loggerService.error('Unsuccessful connection to database');
      }
    }
  }

  async disconnect(): Promise<void> {
    this.client.$disconnect();
  }
}

export { DatabaseService };
