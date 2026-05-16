import { promises as fs } from 'fs';
import path from 'path';

const BASE_PATH = path.join(process.cwd(), 'storage');

/**
 * Yerel dosya sistemi üzerinde S3 benzeri temel storage işlemleri sağlar.
 *
 * Dosyalar proje kök dizinindeki `storage/{Bucket}/{Key}` yapısında saklanır.
 * Geliştirme ortamı veya gerçek S3 kullanılmayan senaryolar için tasarlanmıştır.
 *
 * Sağlanan metodlar:
 * - getObject: Dosyayı okur ve Buffer olarak döner
 * - putObject: Dosyayı belirtilen bucket içine kaydeder
 * - deleteObject: Dosyayı siler
 */

export const Storage = {
  async getObject({ Key, Bucket }: { Key: string; Bucket: string }) {
    const filePath = path.join(BASE_PATH, Bucket, Key);
    const body = await fs.readFile(filePath);

    return {
      Body: body,
    };
  },

  async putObject({ Key, Bucket, Body }: { Key: string; Bucket: string; Body: Buffer }) {
    const dirPath = path.join(BASE_PATH, Bucket);
    const filePath = path.join(dirPath, Key);

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, Body);

    return { ETag: 'local' };
  },

  async deleteObject({ Key, Bucket }: { Key: string; Bucket: string }) {
    const filePath = path.join(BASE_PATH, Bucket, Key);
    await fs.unlink(filePath);

    return {};
  },
};
