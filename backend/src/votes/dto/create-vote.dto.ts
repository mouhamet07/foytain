import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { VoteChoice } from '@prisma/client';

export class CreateVoteDto {
  @ApiProperty()
  @IsString()
  medicalRequestId: string;

  @ApiProperty({ enum: VoteChoice })
  @IsEnum(VoteChoice)
  choice: VoteChoice;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
