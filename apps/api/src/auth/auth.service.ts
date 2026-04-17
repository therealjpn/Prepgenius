import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralService } from '../referral/referral.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private referralService: ReferralService,
  ) {}

  private sanitizeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      isPaid: user.isPaid,
      referralCode: user.referralCode,
      createdAt: user.createdAt,
    };
  }

  private generateToken(userId: number) {
    return this.jwt.sign({ userId });
  }

  async signup(email: string, password: string, fullName: string) {
    if (!email || !password || !fullName) {
      throw new BadRequestException('Email, password, and full name are required');
    }
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email: email.toLowerCase(), passwordHash, fullName },
    });

    return { token: this.generateToken(user.id), user: this.sanitizeUser(user) };
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return { token: this.generateToken(user.id), user: this.sanitizeUser(user) };
  }

  async googleAuth(data: { email: string; googleId: string; name?: string; picture?: string; referralCode?: string }) {
    if (!data.email || !data.googleId) {
      throw new BadRequestException('Google authentication data is incomplete');
    }

    let user = await this.prisma.user.findUnique({ where: { googleId: data.googleId } });
    let isNewUser = false;
    if (!user) {
      user = await this.prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: data.googleId, avatarUrl: data.picture || null },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            email: data.email.toLowerCase(),
            fullName: data.name || data.email,
            googleId: data.googleId,
            avatarUrl: data.picture || null,
          },
        });
        isNewUser = true;
      }
    }

    // Apply referral code for new users
    if (isNewUser && data.referralCode) {
      await this.referralService.applyReferralCode(user.id, data.referralCode);
    }

    return { token: this.generateToken(user.id), user: this.sanitizeUser(user) };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return { user: this.sanitizeUser(user) };
  }
}
