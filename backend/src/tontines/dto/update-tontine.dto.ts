import { PartialType } from '@nestjs/swagger';
import { CreateTontineDto } from './create-tontine.dto';

export class UpdateTontineDto extends PartialType(CreateTontineDto) {}
