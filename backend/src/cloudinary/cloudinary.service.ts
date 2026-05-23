import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  private bufferToStream(buffer: Buffer): Readable {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    return readable;
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<UploadApiResponse> {
    if (!file) throw new BadRequestException('Aucun fichier fourni');

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Format non supporté. Utilisez JPEG, PNG ou WebP');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('La taille du fichier ne doit pas dépasser 5 MB');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `foytain/${folder}`,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) return reject(new BadRequestException(error.message));
          resolve(result!);
        },
      );
      this.bufferToStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadDocument(
    file: Express.Multer.File,
    folder: string = 'documents',
  ): Promise<UploadApiResponse> {
    if (!file) throw new BadRequestException('Aucun fichier fourni');

    const allowed = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Format non supporté. Utilisez PDF, Word ou image');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('La taille du fichier ne doit pas dépasser 10 MB');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `foytain/${folder}`, resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(new BadRequestException(error.message));
          resolve(result!);
        },
      );
      this.bufferToStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
