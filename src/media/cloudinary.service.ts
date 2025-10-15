import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    options: {
      folder?: string;
      category?: string;
      title?: string;
      tags?: string[];
    } = {},
  ) {
    try {
      const { folder = 'ngo-images', category = 'gallery', title, tags } = options;
      
      const uploadOptions = {
        folder: `${folder}/${category}`,
        resource_type: 'image' as const,
        quality: 'auto:good',
        fetch_format: 'auto',
        tags: tags || [],
        context: {
          title: title || '',
          category,
        },
      };

      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        uploadOptions,
      );

      this.logger.log(`Image uploaded successfully: ${result.public_id}`);
      this.logger.log(`Cloudinary URL: ${result.secure_url}`);

      return {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        created_at: result.created_at,
      };
    } catch (error) {
      this.logger.error('Failed to upload image to Cloudinary', error);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  async deleteImage(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Image deleted: ${publicId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete image: ${publicId}`, error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  async getImageUrl(publicId: string, transformations?: any) {
    try {
      return cloudinary.url(publicId, {
        secure: true,
        ...transformations,
      });
    } catch (error) {
      this.logger.error(`Failed to get image URL: ${publicId}`, error);
      throw new Error(`Failed to get image URL: ${error.message}`);
    }
  }

  async getOptimizedImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: string;
      format?: string;
    } = {},
  ) {
    const { width, height, quality = 'auto:good', format = 'auto' } = options;
    
    const transformations: any = {
      quality,
      fetch_format: format,
    };

    if (width) transformations.width = width;
    if (height) transformations.height = height;
    if (width && height) transformations.crop = 'fill';

    return this.getImageUrl(publicId, transformations);
  }

  async searchImages(options: {
    folder?: string;
    tags?: string[];
    category?: string;
    limit?: number;
  } = {}) {
    try {
      const { folder, tags, category, limit = 50 } = options;
      
      let expression = 'resource_type:image';
      
      if (folder) {
        expression += ` AND folder:${folder}*`;
      }
      
      if (category) {
        expression += ` AND context.category:${category}`;
      }
      
      if (tags && tags.length > 0) {
        expression += ` AND tags:(${tags.join(' OR ')})`;
      }

      const result = await cloudinary.search
        .expression(expression)
        .sort_by('created_at', 'desc')
        .max_results(limit)
        .execute();

      return result.resources;
    } catch (error) {
      this.logger.error('Failed to search images', error);
      throw new Error(`Image search failed: ${error.message}`);
    }
  }

  async updateImageMetadata(
    publicId: string,
    metadata: {
      title?: string;
      category?: string;
      tags?: string[];
    },
  ) {
    try {
      const updateOptions: any = {};
      
      if (metadata.tags) {
        updateOptions.tags = metadata.tags.join(',');
      }
      
      if (metadata.title || metadata.category) {
        updateOptions.context = {};
        if (metadata.title) updateOptions.context.title = metadata.title;
        if (metadata.category) updateOptions.context.category = metadata.category;
      }

      const result = await cloudinary.uploader.update_metadata(updateOptions, [publicId]);
      this.logger.log(`Image metadata updated: ${publicId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update image metadata: ${publicId}`, error);
      throw new Error(`Failed to update metadata: ${error.message}`);
    }
  }

  // Helper method to extract public_id from Cloudinary URL
  extractPublicId(url: string): string {
    try {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      return filename.split('.')[0];
    } catch (error) {
      throw new Error('Invalid Cloudinary URL');
    }
  }

  // Generate different sized thumbnails
  generateThumbnails(publicId: string) {
    return {
      thumbnail: this.getOptimizedImageUrl(publicId, { width: 150, height: 150 }),
      small: this.getOptimizedImageUrl(publicId, { width: 300, height: 300 }),
      medium: this.getOptimizedImageUrl(publicId, { width: 600, height: 600 }),
      large: this.getOptimizedImageUrl(publicId, { width: 1200, height: 1200 }),
      original: this.getImageUrl(publicId),
    };
  }
}
