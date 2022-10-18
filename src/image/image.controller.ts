import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Role } from '@prisma/client';
import { pathOr } from 'ramda';
import 'reflect-metadata';

import { BaseController } from '../common/controller/base.controller';
import { TYPES } from '../constants/constants';
import { IImageController } from './image.controller.interface';
import { ILogger } from '../common/logger/logger.interface';
import { UploadMiddleware } from '../common/upload.middleware';
import { IImageService } from './image.service.interface';
import { IConfigService } from '../config/config.service.interface';
import { IUploadClient } from '../common/upload-client.interface';
import { GuardMiddleware } from '../common/guard.middleware';

@injectable()
class ImageController extends BaseController implements IImageController {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.IImageService) private imageService: IImageService,
    @inject(TYPES.IConfigService) private configService: IConfigService,
    @inject(TYPES.IUploadClient) private uploadClient: IUploadClient,
  ) {
    super(loggerService);
    this.bindRoutes([
      {
        path: '/upload',
        method: 'post',
        func: this.upload,
        middlewares: [
          new GuardMiddleware([Role.ADMIN, Role.MANAGER]),
          new UploadMiddleware(
            [
              { name: 'picture', maxCount: 1 },
              { name: 'coverImage', maxCount: 1 },
            ],
            this.configService.get('BACKET_NAME'),
            this.uploadClient.connect(),
          ),
        ],
      },
      {
        path: '/',
        method: 'post',
        func: this.deleteImages,
        middlewares: [new GuardMiddleware([Role.ADMIN, Role.MANAGER])],
      },
    ]);
  }

  /**
   * @swagger
   * /images/upload:
   *   post:
   *     summary: Upload images
   *     tags: [Images]
   *     security:
   *       - AccessToken: []
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               picture:
   *                 type: string
   *                 format: binary
   *               coverImage:
   *                 type: string
   *                 format: binary
   *     responses:
   *       201:
   *          description: The comment was successfully created
   */

  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { files } = req;

      if (!files) {
        this.send(res, StatusCodes.INTERNAL_SERVER_ERROR);
      } else {
        const result = Object.entries(files).reduce(
          (acc: object, [key, value]: [string, Express.Multer.File[]]) => {
            const fileName = pathOr('', [0, 'key'], value);
            const path = `${this.configService.get('BACKET_URL')}/${fileName}`;
            return { ...acc, [key]: path };
          },
          {},
        );

        this.send(res, StatusCodes.CREATED, result);
      }
    } catch (err) {
      return next(err);
    }
  }

  /**
   * @swagger
   * /images:
   *   post:
   *     summary: Delete images [ADMIN, MANAGER]
   *     tags: [Images]
   *     security:
   *       - AccessToken: []
   *     requestBody:
   *       required: true
   *       content:
   *          application/json:
   *            schema:
   *              type: array
   *     responses:
   *       200:
   *         description: Success
   */

  async deleteImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paths = req.body.paths as string[];
      const imageNames = paths.map((path) => path.split('/').splice(-1)[0]);
      await Promise.all(
        imageNames.map((imageName) => this.imageService.deleteImageByPath(imageName)),
      );

      this.ok(res);
    } catch (err) {
      return next(err);
    }
  }
}

export { ImageController };
