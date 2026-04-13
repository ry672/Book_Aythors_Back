import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentAuthor } from '../common/decorators/common.author.decorator';

type AuthResponse = {
  message?: string;
  author?: unknown;
  user?: {
    id: number;
    name: string;
    full_name: string;
    email: string;
    description?: string;
    author_photo?: string | null;
    country?: string;
    is_deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  accessToken: string;
  refreshToken: string;
};

type LogoutResponse = {
  message: string;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register' })
  @ApiResponse({ status: 201 })
  register(@Body() registerdto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerdto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200 })
  login(@Body() logindto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(logindto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200 })
  logout(
    @CurrentAuthor() user: { id: number; email: string },
  ): Promise<LogoutResponse> {
    return this.authService.logout(user.id);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiResponse({ status: 200 })
  async refresh(@Body() dto: RefreshDto): Promise<AuthResponse> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
      }>(dto.refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (!payload?.sub) {
        throw new UnauthorizedException('Неверный refresh token');
      }

      return this.authService.refresh(payload.sub, dto.refresh_token);
    } catch {
      throw new UnauthorizedException('Неверный refresh token');
    }
  }
}