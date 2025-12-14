import sgMail from '@sendgrid/mail';
import { MailDataRequired } from '@sendgrid/mail';

export interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

export interface EmailTemplate {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    type?: string;
  }>;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export class SendGridIntegration {
  private config: SendGridConfig;

  constructor(config: SendGridConfig) {
    this.config = config;
    sgMail.setApiKey(config.apiKey);
  }

  async sendEmail(emailData: EmailTemplate): Promise<any> {
    try {
      const mailData: MailDataRequired = {
        to: emailData.to,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName || 'FormFlow',
        },
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        cc: emailData.cc,
        bcc: emailData.bcc,
        replyTo: emailData.replyTo,
      };

      if (emailData.attachments && emailData.attachments.length > 0) {
        mailData.attachments = emailData.attachments.map((att) => ({
          filename: att.filename,
          content: att.content.toString('base64'),
          type: att.type,
          disposition: 'attachment',
        }));
      }

      const response = await sgMail.send(mailData);
      return response[0];
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendBulkEmail(
    emails: string[],
    subject: string,
    html: string,
    text?: string
  ): Promise<any> {
    try {
      const personalizations = emails.map((email) => ({
        to: [{ email }],
      }));

      const mailData: any = {
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName || 'FormFlow',
        },
        subject,
        personalizations,
        html,
        text,
      };

      const response = await sgMail.send(mailData);
      return response[0];
    } catch (error) {
      console.error('Failed to send bulk email:', error);
      throw error;
    }
  }

  async sendFormSubmissionEmail(
    recipientEmail: string,
    formName: string,
    formData: Record<string, any>,
    submissionId: string
  ): Promise<any> {
    try {
      const htmlContent = this.generateFormSubmissionHTML(
        formName,
        formData,
        submissionId
      );

      return await this.sendEmail({
        to: recipientEmail,
        subject: `New Form Submission: ${formName}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send form submission email:', error);
      throw error;
    }
  }

  async sendConfirmationEmail(
    recipientEmail: string,
    formName: string
  ): Promise<any> {
    try {
      const htmlContent = `
        <h1>Form Submission Confirmed</h1>
        <p>Thank you for submitting the form "${formName}".</p>
        <p>We have received your submission and will review it shortly.</p>
      `;

      return await this.sendEmail({
        to: recipientEmail,
        subject: `Submission Confirmed - ${formName}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      throw error;
    }
  }

  async sendNotificationEmail(
    recipientEmail: string,
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<any> {
    try {
      let htmlContent = `
        <h2>${title}</h2>
        <p>${message}</p>
      `;

      if (actionUrl) {
        htmlContent += `
          <a href="${actionUrl}" style="display: inline-block; padding: 10px 20px; background-color: #36a64f; color: white; text-decoration: none; border-radius: 4px;">View Details</a>
        `;
      }

      return await this.sendEmail({
        to: recipientEmail,
        subject: title,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send notification email:', error);
      throw error;
    }
  }

  private generateFormSubmissionHTML(
    formName: string,
    formData: Record<string, any>,
    submissionId: string
  ): string {
    let dataRows = '';
    Object.entries(formData).forEach(([key, value]) => {
      dataRows += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${key}</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${value}</td>
        </tr>
      `;
    });

    return `
      <h1>New Form Submission</h1>
      <p>Form: <strong>${formName}</strong></p>
      <p>Submission ID: <code>${submissionId}</code></p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Field</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Value</th>
          </tr>
        </thead>
        <tbody>
          ${dataRows}
        </tbody>
      </table>
    `;
  }

  async sendScheduledEmail(
    emailData: EmailTemplate,
    sendAt: Date
  ): Promise<any> {
    try {
      const mailData: any = {
        to: emailData.to,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName || 'FormFlow',
        },
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        sendAt: Math.floor(sendAt.getTime() / 1000),
      };

      const response = await sgMail.send(mailData);
      return response[0];
    } catch (error) {
      console.error('Failed to schedule email:', error);
      throw error;
    }
  }
}

export default SendGridIntegration;
