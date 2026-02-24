export async function sendSms(phone: string, message: string) {
  const xmlBodyStr = `<?xml version="1.0" encoding="UTF-8"?>
  <mainbody>
    <header>
      <company dil="TR">Netgsm</company>
      <usercode>${process.env.NETGSM_USERNAME}</usercode>
      <password>${process.env.NETGSM_PASSWORD}</password>
      <type>1:n</type>
      <msgheader>${process.env.NETGSM_HEADER}</msgheader>
    </header>
    <body>
      <msg>${message}</msg>
      <no>${phone}</no>
    </body>
  </mainbody>`;

  const res = await fetch(process.env.NETGSM_ENDPOINT!, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: xmlBodyStr,
  });

  if (!res.ok) {
    throw new Error('NetGSM SMS failed');
  }

  const text = await res.text();
  return text;
}
