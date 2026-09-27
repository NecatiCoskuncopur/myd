const isProd = process.env.NODE_ENV === 'production';

const testUrls = {
  UPS: 'https://onlinetools.ups.com',
  FEDEX: 'https://apis-sandbox.fedex.com',
  QUICKSHIPPER: 'https://api.quickshipper.com',
  FEDEXDOCUMENT: 'https://documentapitest.prod.fedex.com/sandbox',
  NAVLUNGO: 'https://api-qa.navlungo.com',
};

const prodUrls = {
  UPS: 'https://onlinetools.ups.com',
  FEDEX: 'https://apis.fedex.com',
  QUICKSHIPPER: 'https://api.quickshipper.com',
  FEDEXDOCUMENT: 'https://documentapi.prod.fedex.com',
  NAVLUNGO: 'https://api.navlungo.com',
};

const carrierBaseUrl = isProd ? prodUrls : testUrls;

export default carrierBaseUrl;
