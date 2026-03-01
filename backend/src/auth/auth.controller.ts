import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from 'src/types/express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login-auth.dto';
import { prisma } from 'src/lib/prisma';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginAuthDto) {
    const { token, user } = await this.authService.login(body);
    return new SuccessResponseDto({
      data: {
        token,
        user,
      },
      message: 'Login successful',
    });
  }

  @Post('register')
  async register(
    @Body()
    body: RegisterAuthDto,
  ) {
    await this.authService.register(body);
    return new SuccessResponseDto({
      message: 'Registration successful',
    });
  }

  @ApiBearerAuth('access-token')
  @Post('validate-token')
  @UseGuards(AuthGuard)
  async validateToken(@CurrentUser() currentUser: JwtPayload) {
    const user = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        account: {
          select: {
            email: true,
          },
        },
      },
    });
    return new SuccessResponseDto({
      data: {
        user,
      },
      message: 'Authorization token is valid',
    });
  }
}
