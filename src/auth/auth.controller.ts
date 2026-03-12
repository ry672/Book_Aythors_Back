import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post()
  @ApiOperation({ summary: 'Register' })
  @ApiResponse({ status: 200 })
  register(@Body() registerdto: RegisterDto) {
    return this.authService.register(registerdto);
  }

  @Post()
  @ApiOperation({ summary: 'Register' })
  @ApiResponse({ status: 200 })
  login(@Body() logindto: LoginDto) {
    return this.authService.login(logindto);
  }

}  
