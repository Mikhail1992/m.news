import { inject, injectable } from 'inversify';
const nodemailer = require('nodemailer');
import 'reflect-metadata';

import { TYPES } from '../constants/constants';
import { IMailerService } from './mailer.service.interface';
import { IConfigService } from '../config/config.service.interface';

@injectable()
class MailerService implements IMailerService {
  constructor(@inject(TYPES.IConfigService) private configService: IConfigService) {}

  async sentRestorePasswordLinkToEmail(emailTo: string, url: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: this.configService.get('HOST_NODEMAILER'),
      port: this.configService.get('HOST_NODEMAILER_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('ROOT_EMAIL'),
        pass: this.configService.get('ROOT_EMAIL_PASSWORD'),
      },
    });

    const info = await transporter.sendMail({
      from: `Help of admin 👻 ${this.configService.get('ROOT_EMAIL')}`,
      to: `${emailTo}`,
      subject: 'Restore password',
      html: `Hi,<br/>
            There was a request to restore your password!<br/>
            If you did not make this request then please ignore this email.<br/>
            Otherwise, please click this link to change your password:<br/>
            <br/>
            <b>${url}</b>`,
    });

    nodemailer.getTestMessageUrl(info);
  }
}

export { MailerService };
