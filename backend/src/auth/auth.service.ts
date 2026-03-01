import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { JwtPayload } from '../types/express';

@Injectable()
export class AuthService {
  async register({ firstname, lastname, email, password }: RegisterAuthDto) {
    const exists = await prisma.account.findUnique({
      where: { email },
    });
    if (exists) {
      throw new Error('Account with this email already exists');
    }
    const hashedPassword = await argon2.hash(password);
    const account = await prisma.account.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    await prisma.user.create({
      data: {
        firstname,
        lastname,
        accountId: account.id,
      },
    });
  }
  async login({ email, password }: LoginAuthDto) {
    const account = await prisma.account.findUnique({
      where: { email },
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
      },
    });
    if (!account) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await argon2.verify(account.password!, password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new InternalServerErrorException('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      { accountId: account.id, email: account.email },
      jwtSecret,
    );
    return {
      token,
      user: {
        firstname: account.user[0].firstname,
        lastname: account.user[0].lastname,
        email: account.email,
      },
    };
  }
  async validateToken(token: string): Promise<JwtPayload | undefined> {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    try {
      const payload = jwt.verify(token, jwtSecret) as {
        accountId: string;
        email: string;
      };
      const account = await prisma.account.findUnique({
        where: { id: payload.accountId },
        include: {
          user: true,
        },
      });
      if (!account) {
        throw new Error('Invalid token');
      }

      // By default an account only has one user
      const user = account.user[0];
      if (!user) {
        throw new Error('Invalid token');
      }

      return {
        id: user.id,
        email: account.email!,
        // role: user.role === 'BUSINESS' ? 'BUSINESS' : 'EMPLOYEE',
      };
    } catch (e: unknown) {
      if (e instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
    }
  }
}
