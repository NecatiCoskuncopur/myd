import 'server-only';

import connectMongoDB from '@/lib/db';
import { SystemParam } from '@/models';

const getSystemParam = async (key: string): Promise<string | null> => {
  await connectMongoDB();

  const param = await SystemParam.findOne({
    key: key.trim().toUpperCase(),
  })
    .select('value')
    .lean();

  return param?.value ?? null;
};

export default getSystemParam;
