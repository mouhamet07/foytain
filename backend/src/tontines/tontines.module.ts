import { Module } from '@nestjs/common';
import { TontinesController } from './tontines.controller';
import { TontinesService } from './tontines.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [TontinesController],
  providers: [TontinesService],
  exports: [TontinesService],
})
export class TontinesModule {}
