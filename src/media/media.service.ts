import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';
import { YoutubeService } from './youtube.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { UploadVideoDto } from './dto/upload-video.dto';
import { MediaQueryDto } from './dto/media-query.dto';
import { FileType, MediaCategory } from '@prisma/client';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private youtubeService: YoutubeService,
  ) {}

  async uploadImage(file: Express.Multer.File, uploadDto: UploadImageDto, userId: string) {
    try {
      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('File must be an image');
      }

      // Upload to Cloudinary
      const cloudinaryResult = await this.cloudinaryService.uploadImage(file, {
        folder: 'ngo-images',
        category: uploadDto.category?.toLowerCase(),
        title: uploadDto.title,
        tags: uploadDto.tags,
      });

      this.logger.log(`Cloudinary result: ${JSON.stringify({
        public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.url,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height
      })}`);

      // Save to database
      const mediaFile = await this.prisma.mediaFile.create({
        data: {
          filename: file.originalname,
          originalName: file.originalname,
          filePath: cloudinaryResult.public_id,
          fileUrl: cloudinaryResult.url,
          mimeType: file.mimetype,
          fileSize: file.size,
          fileType: FileType.IMAGE,
          category: (uploadDto.category as MediaCategory) || MediaCategory.GALLERY,
          title: uploadDto.title,
          description: uploadDto.description,
          altText: uploadDto.altText,
          tags: uploadDto.tags || [],
          isFeatured: uploadDto.isFeatured || false,
          isPublic: uploadDto.isPublic !== false,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          cloudinaryId: cloudinaryResult.public_id,
          uploadedBy: userId,
          // Entity associations
          bloodCampId: uploadDto.bloodCampId || null,
          medicalCampId: uploadDto.medicalCampId || null,
          teamMemberId: uploadDto.teamMemberId || null,
          eventId: uploadDto.eventId || null,
        } as any,
      });

      this.logger.log(`Image uploaded successfully: ${mediaFile.id}`);
      return mediaFile;
    } catch (error) {
      this.logger.error('Failed to upload image', error);
      throw error;
    }
  }

  async uploadVideo(file: Express.Multer.File, uploadDto: UploadVideoDto, userId: string) {
    try {
      this.logger.log(`Attempting to upload video: ${file.originalname}`);
      this.logger.log(`File details: ${JSON.stringify({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname
      })}`);

      // Validate file type - check both mimetype and file extension
      const isVideoMimeType = file.mimetype.startsWith('video/');
      const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
      const hasVideoExtension = videoExtensions.some(ext =>
        file.originalname.toLowerCase().endsWith(ext)
      );

      if (!isVideoMimeType && !hasVideoExtension) {
        this.logger.error(`Invalid video file: mimetype=${file.mimetype}, filename=${file.originalname}`);
        throw new BadRequestException(`File must be a video. Received mimetype: ${file.mimetype}, filename: ${file.originalname}`);
      }

      if (!isVideoMimeType) {
        this.logger.warn(`Video file has non-video mimetype but valid extension: ${file.mimetype} -> ${file.originalname}`);
      }

      // Upload to YouTube
      const youtubeResult = await this.youtubeService.uploadVideo(file, {
        title: uploadDto.title,
        description: uploadDto.description,
        tags: uploadDto.tags,
        privacyStatus: uploadDto.privacyStatus || 'public',
      });

      // Save to database
      const mediaFile = await this.prisma.mediaFile.create({
        data: {
          filename: file.originalname,
          originalName: file.originalname,
          filePath: youtubeResult.videoId,
          fileUrl: youtubeResult.videoUrl,
          mimeType: file.mimetype,
          fileSize: file.size,
          fileType: FileType.VIDEO,
          category: (uploadDto.category as MediaCategory) || MediaCategory.GALLERY,
          title: uploadDto.title,
          description: uploadDto.description,
          tags: uploadDto.tags || [],
          isFeatured: uploadDto.isFeatured || false,
          isPublic: uploadDto.isPublic !== false,
          videoId: youtubeResult.videoId,
          videoUrl: youtubeResult.videoUrl,
          thumbnailUrl: youtubeResult.thumbnailUrl,
          privacyStatus: uploadDto.privacyStatus || 'public',
          uploadedBy: userId,
          // Entity associations
          bloodCampId: uploadDto.bloodCampId || null,
          medicalCampId: uploadDto.medicalCampId || null,
          teamMemberId: uploadDto.teamMemberId || null,
          eventId: uploadDto.eventId || null,
        } as any,
      });

      this.logger.log(`Video uploaded successfully: ${mediaFile.id}`);
      return mediaFile;
    } catch (error) {
      this.logger.error('Failed to upload video', error);
      throw error;
    }
  }

  async findAll(queryDto: MediaQueryDto) {
    const {
      search,
      category,
      fileType,
      isFeatured,
      isPublic,
      tags,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      bloodCampId,
      medicalCampId,
      teamMemberId,
      eventId,
    } = queryDto;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { filename: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) (where as any).category = category as MediaCategory;
    if (fileType) {
      // Convert string to proper FileType enum (handle both singular and plural forms)
      let fileTypeEnum: FileType;
      switch (fileType.toUpperCase()) {
        case 'IMAGE':
        case 'IMAGES':
          fileTypeEnum = FileType.IMAGE;
          break;
        case 'VIDEO':
        case 'VIDEOS':
          fileTypeEnum = FileType.VIDEO;
          break;
        case 'DOCUMENT':
        case 'DOCUMENTS':
          fileTypeEnum = FileType.DOCUMENT;
          break;
        default:
          fileTypeEnum = fileType as FileType;
      }
      (where as any).fileType = fileTypeEnum;
    }
    if (isFeatured !== undefined) (where as any).isFeatured = isFeatured;
    if (isPublic !== undefined) (where as any).isPublic = isPublic;

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      (where as any).tags = {
        hasSome: tagArray,
      };
    }

    // Entity association filters
    if (bloodCampId) (where as any).bloodCampId = bloodCampId;
    if (medicalCampId) (where as any).medicalCampId = medicalCampId;
    if (teamMemberId) (where as any).teamMemberId = teamMemberId;
    if (eventId) (where as any).eventId = eventId;

    const skip = (page - 1) * limit;

    const [mediaFiles, total] = await Promise.all([
      this.prisma.mediaFile.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.mediaFile.count({ where: where as any }),
    ]);

    return {
      data: mediaFiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const mediaFile = await this.prisma.mediaFile.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!mediaFile) {
      throw new NotFoundException('Media file not found');
    }

    return mediaFile;
  }

  async update(id: string, updateData: Partial<UploadImageDto & UploadVideoDto>) {
    const mediaFile = await this.findOne(id);

    const updatedFile = await this.prisma.mediaFile.update({
      where: { id },
      data: {
        title: updateData.title,
        description: updateData.description,
        altText: updateData.altText,
        category: updateData.category,
        tags: updateData.tags,
        isFeatured: updateData.isFeatured,
        isPublic: updateData.isPublic,
      } as any,
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Update metadata in external services
    if (mediaFile.fileType === 'IMAGE' && (mediaFile as any).cloudinaryId) {
      try {
        await this.cloudinaryService.updateImageMetadata((mediaFile as any).cloudinaryId, {
          title: updateData.title,
          category: updateData.category?.toLowerCase(),
          tags: updateData.tags,
        });
      } catch (error) {
        this.logger.warn('Failed to update Cloudinary metadata', error);
      }
    }

    if (mediaFile.fileType === 'VIDEO' && (mediaFile as any).videoId) {
      try {
        await this.youtubeService.updateVideo((mediaFile as any).videoId, {
          title: updateData.title,
          description: updateData.description,
          tags: updateData.tags,
        });
      } catch (error) {
        this.logger.warn('Failed to update YouTube metadata', error);
      }
    }

    this.logger.log(`Media file updated: ${id}`);
    return updatedFile;
  }

  async remove(id: string) {
    const mediaFile = await this.findOne(id);

    // Delete from external services
    if (mediaFile.fileType === 'IMAGE' && (mediaFile as any).cloudinaryId) {
      try {
        await this.cloudinaryService.deleteImage((mediaFile as any).cloudinaryId);
      } catch (error) {
        this.logger.warn('Failed to delete from Cloudinary', error);
      }
    }

    if (mediaFile.fileType === 'VIDEO' && (mediaFile as any).videoId) {
      try {
        await this.youtubeService.deleteVideo((mediaFile as any).videoId);
      } catch (error) {
        this.logger.warn('Failed to delete from YouTube', error);
      }
    }

    // Delete from database
    await this.prisma.mediaFile.delete({
      where: { id },
    });

    this.logger.log(`Media file deleted: ${id}`);
    return { message: 'Media file deleted successfully' };
  }

  async getFeatured(category?: string, limit: number = 10) {
    const where: any = { isFeatured: true, isPublic: true };
    if (category) where.category = category as MediaCategory;

    return this.prisma.mediaFile.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getByCategory(category: string, limit?: number) {
    return this.prisma.mediaFile.findMany({
      where: {
        ...(category && { category: category.toUpperCase() as MediaCategory }),
        isPublic: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getStats() {
    const [totalImages, totalVideos, featuredCount, recentCount] = await Promise.all([
      this.prisma.mediaFile.count({ where: { fileType: 'IMAGE' } }),
      this.prisma.mediaFile.count({ where: { fileType: 'VIDEO' } }),
      this.prisma.mediaFile.count({ where: { isFeatured: true } as any }),
      this.prisma.mediaFile.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    return {
      totalImages,
      totalVideos,
      totalFiles: totalImages + totalVideos,
      featuredCount,
      recentCount,
    };
  }

  // Entity-specific media retrieval methods
  async getBloodCampMedia(bloodCampId: string) {
    return this.prisma.mediaFile.findMany({
      where: { bloodCampId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async getMedicalCampMedia(medicalCampId: string) {
    return this.prisma.mediaFile.findMany({
      where: { medicalCampId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async getTeamMemberMedia(teamMemberId: string) {
    return this.prisma.mediaFile.findMany({
      where: { teamMemberId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async getEventMedia(eventId: string) {
    return this.prisma.mediaFile.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
}
