interface IImageService {
  deleteImageByPath: (path: string) => Promise<unknown>;
}

export { IImageService };
