import nodemailer from 'nodemailer';

import getSystemParam from './getSystemParam';

const getMailTransport = async () => {
  const [host, port, user, pass] = await Promise.all([
    getSystemParam('MAIL_HOST'),
    getSystemParam('MAIL_PORT'),
    getSystemParam('MAIL_USER'),
    getSystemParam('MAIL_PASS'),
  ]);

  if (!host || !port || !user || !pass) {
    throw new Error('Mail sistem parametreleri eksik.');
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: true,
    auth: {
      user,
      pass,
    },
  });
};

export default getMailTransport;
