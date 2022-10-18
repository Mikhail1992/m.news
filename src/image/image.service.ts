import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import Exception from '../common/Exception';
import { IUploadClient } from '../common/upload-client.interface';
import { IConfigService } from '../config/config.service.interface';
import { TYPES } from '../constants/constants';
import { IImageService } from './image.service.interface';

@injectable()
class ImageService implements IImageService {
  constructor(
    @inject(TYPES.IConfigService) private configService: IConfigService,
    @inject(TYPES.IUploadClient) private uploadClient: IUploadClient,
  ) {}

  async deleteImageByPath(path: string): Promise<unknown> {
    const name = path.split('/').splice(-1)[0];

    const result = await new Promise((resolve, reject) => {
      this.uploadClient
        .connect()
        .removeObject(this.configService.get('BACKET_NAME'), name, function (err) {
          if (err) {
            return reject(
              new Exception(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Unable to remove object: ${err.message}`,
              ),
            );
          }

          return resolve({});
        });
    });

    return result;
  }
}

export { ImageService };
