import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { getCloudinary } from './cloudinary.config';

interface UploadResponse {
  url: string;
  publicId: string;
}

interface CloudinaryDestroyResponse {
  result: string;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly ALLOWED_MIMETYPES = ['image/jpeg', 'image/png'];
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly UPLOAD_FOLDER =
    process.env.CLOUDINARY_UPLOAD_FOLDER || 'stanovi-platforma/buildings';

  async uploadImage(file: Express.Multer.File): Promise<UploadResponse> {
    // Validacija veličine
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    // Validacija MIME tipa
    if (!this.ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.ALLOWED_MIMETYPES.join(', ')}`,
      );
    }

    try {
      const cloudinary = getCloudinary();

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: this.UPLOAD_FOLDER,
            resource_type: 'auto',
            quality: 'auto',
          },
          (error, result) => {
            if (error) {
              reject(
                new BadRequestException(
                  `Cloudinary upload failed: ${error.message}`,
                ),
              );
            } else if (result) {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
              });
            }
          },
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(`Image upload failed: ${error.message}`);
      }
      throw error;
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      const cloudinary = getCloudinary();
      const result = (await cloudinary.uploader.destroy(
        publicId,
      )) as CloudinaryDestroyResponse;

      if (result.result !== 'ok') {
        throw new BadRequestException(
          `Cloudinary deletion returned non-ok status for ${publicId}: ${result.result}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to delete image from Cloudinary: ${message}`);
      throw error;
    }
  }

  async deleteMultipleImages(publicIds: string[]): Promise<void> {
    await Promise.all(publicIds.map((publicId) => this.deleteImage(publicId)));
  }
}
