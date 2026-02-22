import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from 'src/types/express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login-auth.dto';
import { prisma } from 'src/lib/prisma';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginAuthDto) {
    const token = await this.authService.login(body);
    return {
      success: true,
      message: 'Login successful',
      token,
    };
  }

  @Post('register')
  async register(
    @Body()
    body: RegisterAuthDto,
  ) {
    await this.authService.register(body);
    return {
      success: true,
      message: 'Registration successful',
    };
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
    return {
      success: true,
      message: 'Authorization token is valid',
      user,
    };
  }
}
