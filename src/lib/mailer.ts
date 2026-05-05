import nodemailer from 'nodemailer';

/**
 * Uygulama genelinde e-posta gönderimi için kullanılan Nodemailer transport nesnesi.
 * Bağlantı bilgileri environment değişkenlerinden alınır.
 */

const MydMail = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export default MydMail;
