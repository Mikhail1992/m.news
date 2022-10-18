import { Request, Response, NextFunction } from 'express';
import multerMinIOStorage from 'multer-minio-storage';
import multer, { Field } from 'multer';
import { Client } from 'minio';

import { IMiddleware } from './middleware.interface';

export class UploadMiddleware implements IMiddleware {
  constructor(
    private fields: ReadonlyArray<Field>,
    private backetName: string,
    private minioClient: Client,
  ) {}

  execute(req: Request, res: Response, next: NextFunction): void {
    return multer({
      storage: multerMinIOStorage({
        minioClient: this.minioClient,
        bucket: this.backetName,
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          const format = `.${file.originalname?.split('.').slice(-1)}`;
          cb(null, `${Date.now().toString()}${format}`);
        },
        contentType: multerMinIOStorage.AUTO_CONTENT_TYPE,
      }),
      limits: {
        fileSize: 3e6,
      },
    }).fields(this.fields)(req, res, next);
  }
}
