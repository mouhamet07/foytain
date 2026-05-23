import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateContributionDto {
  @ApiProperty()
  @IsString()
  tontineId: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: '2024-01-31' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ example: 'Janvier 2024' })
  @IsString()
  periodLabel: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class MarkPaidDto {
  @ApiProperty()
  @IsString()
  paymentId: string;
}
