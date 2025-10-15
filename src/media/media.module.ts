import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryService } from './cloudinary.service';
import { YoutubeService } from './youtube.service';

@Module({
  imports: [PrismaModule],
  controllers: [MediaController],
  providers: [MediaService, CloudinaryService, YoutubeService],
  exports: [MediaService, CloudinaryService, YoutubeService],
})
export class MediaModule {}
