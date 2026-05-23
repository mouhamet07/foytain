import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Votes')
@Controller('votes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @ApiOperation({ summary: 'Cast a vote on a medical request' })
  cast(@CurrentUser('id') userId: string, @Body() dto: CreateVoteDto) {
    return this.votesService.cast(userId, dto);
  }

  @Get('request/:requestId')
  @ApiOperation({ summary: 'Get votes for a medical request' })
  getVotes(@Param('requestId') requestId: string) {
    return this.votesService.getVotesForRequest(requestId);
  }

  @Get('request/:requestId/my-vote')
  @ApiOperation({ summary: 'Get my vote on a request' })
  getMyVote(@Param('requestId') requestId: string, @CurrentUser('id') userId: string) {
    return this.votesService.getUserVote(userId, requestId);
  }
}
