interface IMailerService {
  sentRestorePasswordLinkToEmail: (email: string, url: string) => Promise<void>;
}

export { IMailerService };
