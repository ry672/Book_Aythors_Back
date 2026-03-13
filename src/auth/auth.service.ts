import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { UniqueConstraintError } from 'sequelize';
import { AuthorModel } from 'src/author/model/author.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AuthorModel)
    private readonly authorModel: typeof AuthorModel,
    private readonly jwtService: JwtService,
  ) { }

  async register(dto: {
    email: string;
    password: string;
    name: string;
    full_name: string;
    description?: string;
    country?: string;
  }) {
    try {
      const exists = await this.authorModel.findOne({
        where: { email: dto.email },
      });

      if (exists) {
        throw new BadRequestException('Email already exists');
      }

      if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
        throw new InternalServerErrorException(
          'JWT secrets are not configured',
        );
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const author = await this.authorModel.create({
        email: dto.email.trim().toLowerCase(),
        name: dto.name.trim(),
        full_name: dto.full_name.trim(),
        description: dto.description?.trim() ?? '',
        country: dto.country?.trim() ?? '',
        password: hashedPassword,
      });

      const tokens = await this.signTokens(author.id, author.email);
      await this.setRefreshHash(author.id, tokens.refreshToken);

      return {
        message: 'Register success',
        author,
        ...tokens,
      };
    } catch (error) {
      console.error('REGISTER ERROR:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof UniqueConstraintError) {
        throw new BadRequestException('Author with this email already exists');
      }

      throw new InternalServerErrorException('Failed to register author');
    }
  }

  async login(dto: { email: string; password: string }) {
    try {
      const author = await this.authorModel.findOne({
        where: { email: dto.email.trim().toLowerCase() },
      });

      if (!author) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isMatch = await bcrypt.compare(dto.password, author.password);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
        throw new InternalServerErrorException(
          'JWT secrets are not configured',
        );
      }

      const tokens = await this.signTokens(author.id, author.email);
      await this.setRefreshHash(author.id, tokens.refreshToken);

      return {
        message: 'Login success',
        author,
        ...tokens,
      };
    } catch (error) {
      console.error('LOGIN ERROR:', error);

      if (
        error instanceof UnauthorizedException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to login');
    }
  }

  async refreshTokens(authorId: number, refreshToken: string) {
    try {
      const author = await this.authorModel.findByPk(authorId);

      if (!author || !author.hashed_refresh_token) {
        throw new UnauthorizedException('Access denied');
      }

      const tokenMatches = await bcrypt.compare(
        refreshToken,
        author.hashed_refresh_token,
      );

      if (!tokenMatches) {
        throw new UnauthorizedException('Access denied');
      }

      if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
        throw new InternalServerErrorException(
          'JWT secrets are not configured',
        );
      }

      const tokens = await this.signTokens(author.id, author.email);
      await this.setRefreshHash(author.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      console.error('REFRESH ERROR:', error);

      if (
        error instanceof UnauthorizedException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to refresh token');
    }
  }

  async logout(authorId: number) {
    try {
      await this.authorModel.update(
        { hashed_refresh_token: null },
        { where: { id: authorId } },
      );

      return { message: 'Logout success' };
    } catch (error) {
      console.error('LOGOUT ERROR:', error);
      throw new InternalServerErrorException('Failed to logout');
    }
  }

  private async signTokens(authorId: number, email: string) {
    const payload = { sub: authorId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
  

  private async setRefreshHash(authorId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 7);

    await this.authorModel.update(
      { hashed_refresh_token: hashedRefreshToken },
      { where: { id: authorId } },
    );
  }
}
