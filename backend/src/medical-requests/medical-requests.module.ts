import { Module } from '@nestjs/common';
import { MedicalRequestsController } from './medical-requests.controller';
import { MedicalRequestsService } from './medical-requests.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [NotificationsModule, CloudinaryModule],
  controllers: [MedicalRequestsController],
  providers: [MedicalRequestsService],
  exports: [MedicalRequestsService],
})
export class MedicalRequestsModule {}
