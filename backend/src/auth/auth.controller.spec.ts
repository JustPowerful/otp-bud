jest.mock('src/lib/prisma');

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { prisma } from 'src/lib/prisma';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock; register: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();
    authService = { login: jest.fn(), register: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('should return a success response after login', async () => {
    const body = { email: 'user@example.com', password: 'password' };
    const authResult = {
      token: 'jwt-token',
      user: { firstname: 'Ada', lastname: 'Lovelace', email: body.email },
    };
    authService.login.mockResolvedValue(authResult);

    await expect(controller.login(body)).resolves.toEqual({
      success: true,
      data: authResult,
      message: 'Login successful',
    });
    expect(authService.login).toHaveBeenCalledWith(body);
  });

  it('should register and return a success response', async () => {
    const body = {
      firstname: 'Ada',
      lastname: 'Lovelace',
      email: 'user@example.com',
      password: 'password',
    };
    authService.register.mockResolvedValue(undefined);

    await expect(controller.register(body)).resolves.toEqual({
      success: true,
      message: 'Registration successful',
    });
    expect(authService.register).toHaveBeenCalledWith(body);
  });

  it('should return the current user when validating a token', async () => {
    const currentUser = { id: 'user-id', email: 'user@example.com' };
    const user = {
      id: currentUser.id,
      firstname: 'Ada',
      lastname: 'Lovelace',
      account: { email: currentUser.email },
    };
    jest.mocked(prisma.user.findUnique).mockResolvedValue(user as never);

    await expect(controller.validateToken(currentUser)).resolves.toEqual({
      success: true,
      data: { user },
      message: 'Authorization token is valid',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: currentUser.id },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        account: { select: { email: true } },
      },
    });
  });
});
