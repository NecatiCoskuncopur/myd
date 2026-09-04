import getSystemParam from './getSystemParam';

/**
 * NetGSM servisi üzerinden SMS gönderimi yapar.
 *
 * @param phone - SMS gönderilecek alıcı telefon numarası
 * @param message - Gönderilecek SMS içeriği
 * @returns NetGSM API tarafından dönen ham yanıt metni
 *
 * @throws NetGSM isteği başarısız olursa hata fırlatır
 */

const sendSms = async (phone: string, message: string) => {
  const [username, password, header, endpoint] = await Promise.all([
    getSystemParam('NETGSM_USERNAME'),
    getSystemParam('NETGSM_PASSWORD'),
    getSystemParam('NETGSM_HEADER'),
    getSystemParam('NETGSM_ENDPOINT'),
  ]);

  if (!username || !password || !header || !endpoint) {
    throw new Error('NetGSM sistem parametreleri eksik.');
  }

  const finalMessage = message.replace(/]]>/g, ']]&gt;');

  const xmlBodyStr = `<?xml version="1.0" encoding="UTF-8"?>
  <mainbody>
    <header>
      <usercode>${username}</usercode>
      <password>${password}</password>
      <msgheader>${header}</msgheader>
      <type>1:n</type>
    </header>
    <body>
      <msg><![CDATA[${finalMessage}]]></msg>
      <no>${phone}</no>
    </body>
  </mainbody>`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: xmlBodyStr,
  });

  if (!res.ok) {
    throw new Error('NetGSM SMS failed');
  }

  return res.text();
};

export default sendSms;
