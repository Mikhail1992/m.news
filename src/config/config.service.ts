import { config, DotenvConfigOutput, DotenvParseOutput } from 'dotenv';
import 'dotenv/config';
import { inject, injectable } from 'inversify';
import { ILogger } from '../common/logger/logger.interface';
import { TYPES } from '../constants/constants';
import { IConfigService } from './config.service.interface';

@injectable()
class ConfigService implements IConfigService {
  private config: DotenvParseOutput;
  constructor(@inject(TYPES.ILogger) private loggerService: ILogger) {
    const result: DotenvConfigOutput = config();
    if (result.error) {
      this.loggerService.error('[ConfigService] The .env file could not be read or is missing');
    } else {
      this.loggerService.log('[ConfigService]: .env file loaded');
      this.config = result.parsed as DotenvParseOutput;
    }
  }

  get(key: string): string {
    return this.config[key];
  }
}

export { ConfigService };
