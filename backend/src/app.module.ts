import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TontinesModule } from './tontines/tontines.module';
import { MembershipsModule } from './memberships/memberships.module';
import { ContributionsModule } from './contributions/contributions.module';
import { PaymentsModule } from './payments/payments.module';
import { MedicalRequestsModule } from './medical-requests/medical-requests.module';
import { VotesModule } from './votes/votes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminModule } from './admin/admin.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MailModule } from './mail/mail.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    TontinesModule,
    MembershipsModule,
    ContributionsModule,
    PaymentsModule,
    MedicalRequestsModule,
    VotesModule,
    NotificationsModule,
    DashboardModule,
    AdminModule,
    CloudinaryModule,
    MailModule,
  ],
  providers: [
    // Global JWT guard — use @Public() decorator to bypass
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global roles guard — use @Roles() decorator to restrict
    { provide: APP_GUARD, useClass: RolesGuard },
    // Global throttler guard
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
