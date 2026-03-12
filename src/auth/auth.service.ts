import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { AuthorModel } from 'src/author/model/author.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AuthorModel)
    private readonly authorModel: typeof AuthorModel,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: {
    email: string;
    password: string;
    name?: string;
    full_name?: string;
  }) {
    const exists = await this.authorModel.findOne({
      where: { email: dto.email },
    });

    if (exists) {
      throw new BadRequestException('Author already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const author = await this.authorModel.create({
      email: dto.email,
      name: "",
      full_name: "",
      password: hashedPassword,
    });

    const tokens = await this.signTokens(author.id, author.email);
    await this.setRefreshHash(author.id, tokens.refreshToken);

    return {
      message: 'Register success',
      author,
      ...tokens,
    };
  }

  async login(dto: { email: string; password: string }) {
    const author = await this.authorModel.findOne({
      where: { email: dto.email },
    });

    if (!author) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, author.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.signTokens(author.id, author.email);
    await this.setRefreshHash(author.id, tokens.refreshToken);

    return {
      message: 'Login success',
      author,
      ...tokens,
    };
  }

  async refreshTokens(authorId: number, refreshToken: string) {
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

    const tokens = await this.signTokens(author.id, author.email);
    await this.setRefreshHash(author.id, tokens.refreshToken);

    return tokens;
  }

  async logout(authorId: number) {
    await this.authorModel.update(
      { hashed_refresh_token: null },
      { where: { id: authorId } },
    );

    return { message: 'Logout success' };
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
