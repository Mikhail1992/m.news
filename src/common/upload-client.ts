import { inject, injectable } from 'inversify';
import * as Minio from 'minio';
import { IConfigService } from '../config/config.service.interface';
import { TYPES } from '../constants/constants';

export const minioEndPoint = 'minio.tools.godeltech.com';

@injectable()
class UploadClient {
  client: Minio.Client;
  constructor(@inject(TYPES.IConfigService) private configService: IConfigService) {}

  connect() {
    return new Minio.Client({
      endPoint: minioEndPoint,
      port: 80,
      useSSL: false,
      accessKey: this.configService.get('ACCESS_KEY'),
      secretKey: this.configService.get('SECRET_KEY'),
    });
  }
}

export { UploadClient };
