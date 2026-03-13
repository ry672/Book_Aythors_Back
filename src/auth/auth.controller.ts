import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentAuthor } from '../common/decorators/common.author.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register' })
  @ApiResponse({ status: 201 })
  register(@Body() registerdto: RegisterDto) {
    return this.authService.register(registerdto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200 })
  login(@Body() logindto: LoginDto) {
    return this.authService.login(logindto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200 })
  logout(@CurrentAuthor() user: { id: number; email: string }) {
    return this.authService.logout(user.id);
  }
}