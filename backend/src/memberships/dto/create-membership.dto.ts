import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class JoinTontineDto {
  @ApiProperty()
  @IsString()
  tontineId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invitationToken?: string;
}

export class InviteMemberDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;
}
