import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsEnum, IsNumber, IsDateString, IsOptional,
  MinLength, MaxLength, Min, IsInt,
} from 'class-validator';
import { TontineType, TontineFrequency } from '@prisma/client';

export class CreateTontineDto {
  @ApiProperty({ example: 'Solidarité Santé Dakar' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: TontineType, default: TontineType.PUBLIC })
  @IsEnum(TontineType)
  type: TontineType;

  @ApiProperty({ enum: TontineFrequency, default: TontineFrequency.MONTHLY })
  @IsEnum(TontineFrequency)
  frequency: TontineFrequency;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(100)
  contributionAmount: number;

  @ApiPropertyOptional({ example: 'XOF' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(2)
  maxMembers?: number;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rules?: string;
}
