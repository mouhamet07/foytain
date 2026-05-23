import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, Min, MinLength, MaxLength } from 'class-validator';

export class CreateMedicalRequestDto {
  @ApiProperty()
  @IsString()
  tontineId: string;

  @ApiProperty({ example: 'Opération chirurgicale urgente' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Description détaillée de la situation médicale...' })
  @IsString()
  @MinLength(20)
  description: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(1000)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hospitalName?: string;

  @ApiPropertyOptional({ example: '2024-02-01' })
  @IsOptional()
  @IsDateString()
  votingDeadline?: string;
}

export class ReviewMedicalRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
