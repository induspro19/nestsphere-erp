import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        userRoles: {
          include: { role: true },
        },
        society: true,
      },
    });

    if (!user || user.isDeleted || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials or account suspended');
    }

    const passwordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = user.userRoles.map((ur) => ur.role.code);
    const tokens = await this.generateTokens(user.id, user.email, roles, user.societyId || undefined);

    // Save refresh token hash in DB
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash,
        lastLoginAt: new Date(),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        roles,
        societyId: user.societyId,
        societyName: user.society?.name || null,
      },
      tokens,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'super_secret_refresh_token_key_change_in_production_67890',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          userRoles: { include: { role: true } },
        },
      });

      if (!user || !user.refreshTokenHash || user.isDeleted) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isTokenMatched = await bcrypt.compare(refreshTokenDto.refreshToken, user.refreshTokenHash);
      if (!isTokenMatched) {
        throw new UnauthorizedException('Refresh token revoked');
      }

      const roles = user.userRoles.map((ur) => ur.role.code);
      const tokens = await this.generateTokens(user.id, user.email, roles, user.societyId || undefined);

      const newRefreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: newRefreshTokenHash },
      });

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string, roles: string[], societyId?: string) {
    const payload = { sub: userId, email, roles, societyId };

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'super_secret_access_token_key_change_in_production_12345';
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'super_secret_refresh_token_key_change_in_production_67890';

    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 mins in seconds
    };
  }
}
