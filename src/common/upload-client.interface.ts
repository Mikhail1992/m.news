import * as Minio from 'minio';

export interface IUploadClient {
  client: Minio.Client;
  connect: () => Minio.Client;
}
