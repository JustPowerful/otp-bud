import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { TokenService } from './token.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { JwtPayload } from 'src/types/express';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TokenOwnershipGuard } from './guards/token-ownership/token-ownership.guard';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  async createToken(
    @CurrentUser() user,
    @Body() createTokenDto: CreateTokenDto,
  ) {
    // This will create a token for the authenticated user with the specified expiration time or no expiration if not provided
    const token = this.tokenService.createToken(
      user.id,
      createTokenDto.expirationTime,
    );
    return new SuccessResponseDto({
      data: { token },
      message: 'Token created successfully',
      meta: {
        expirationTime:
          createTokenDto.expirationTime || 'No expiration (permanent token)',
      },
    });
  }

  @Get('/details/:token')
  @UseGuards(AuthGuard, TokenOwnershipGuard)
  async getTokenDetails(@Param('token') token: string) {
    const data = await this.tokenService.getToken(token);
    if (!data) {
      throw new NotFoundException('Token not found');
    }
    return new SuccessResponseDto({
      message: 'Token details retrieved successfully',
      data,
    });
  }

  @Delete('revoke/:token')
  @UseGuards(AuthGuard, TokenOwnershipGuard)
  async revokeToken(@CurrentUser() user, @Param('token') token: string) {
    const data = await this.tokenService.revokeToken(token);
    return new SuccessResponseDto({
      message: 'Token revoked successfully',
      data,
    });
  }

  @Post('paginate')
  @UseGuards(AuthGuard)
  async paginateTokens(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: PaginationDto,
  ) {
    const {
      items,
      total,
      page = 1,
      limit = 5,
    } = await this.tokenService.paginateTokens(user.id, paginationDto);
    return new SuccessResponseDto({
      data: items,
      meta: {
        total,
        page,
        limit,
        nextPage: page * limit < total ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
      message: 'Tokens paginated successfully',
    });
  }
}
