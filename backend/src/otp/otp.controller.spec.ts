import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from 'src/email/email.service';
import { ValidateTokenKeyGuard } from 'src/common/guards/validate-token-key/validate-token-key.guard';
import { RedisService } from 'src/redis/redis.service';
import { TemplateService } from 'src/template/template.service';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';

describe('OtpController', () => {
  let controller: OtpController;
  let otpService: {
    generateOtp: jest.Mock;
    verifyOtp: jest.Mock;
    deleteOtp: jest.Mock;
  };
  let emailService: { sendEmail: jest.Mock };
  let templateService: { getActiveTemplate: jest.Mock };
  let redis: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();
    otpService = {
      generateOtp: jest.fn(),
      verifyOtp: jest.fn(),
      deleteOtp: jest.fn(),
    };
    emailService = { sendEmail: jest.fn() };
    templateService = { getActiveTemplate: jest.fn() };
    redis = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [
        { provide: OtpService, useValue: otpService },
        { provide: EmailService, useValue: emailService },
        { provide: TemplateService, useValue: templateService },
        { provide: RedisService, useValue: redis },
      ],
    })
      .overrideGuard(ValidateTokenKeyGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();
    controller = module.get<OtpController>(OtpController);
  });

  it('should be defined', () => expect(controller).toBeDefined());

  describe('sendOtp', () => {
    it('should create an OTP and send it using the application template', async () => {
      const body = {
        email: 'user@example.com',
        applicationId: 'application-id',
        token: 'api-key',
      };
      otpService.generateOtp.mockImplementation(async (expiresAt) => ({
        otp: '123456',
        expiresAt,
      }));
      templateService.getActiveTemplate.mockResolvedValue({
        subject: 'Your login code',
        body: 'Code {{otp}} for {{appname}} expires {{expiry}} for {{email}}',
        application: { name: 'Demo' },
      });

      await expect(controller.sendOtp(body)).resolves.toEqual({
        success: true,
        message: 'OTP sent successfully',
      });

      expect(otpService.generateOtp).toHaveBeenCalledWith(
        expect.any(Date),
        body.email,
        body.applicationId,
      );
      expect(templateService.getActiveTemplate).toHaveBeenCalledWith(
        body.applicationId,
      );
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: body.email,
        subject: 'Your login code',
        text: expect.stringContaining('123456'),
        html: expect.stringContaining('123456'),
        applicationId: body.applicationId,
      });
    });

    it('should send a fallback email when there is no active template', async () => {
      const body = {
        email: 'user@example.com',
        applicationId: 'application-id',
        token: 'api-key',
      };
      otpService.generateOtp.mockResolvedValue({ otp: '654321' });
      templateService.getActiveTemplate.mockResolvedValue(null);

      await controller.sendOtp(body);

      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: body.email,
        subject: 'Your OTP Code',
        text: expect.stringContaining('654321'),
        html: expect.stringContaining('654321'),
        applicationId: body.applicationId,
      });
    });
  });

  describe('validateOtp', () => {
    const body = {
      email: 'user@example.com',
      otp: '123456',
      applicationId: 'application-id',
      token: 'api-key',
    };

    it('should reject validation while the address is blocked', async () => {
      redis.get.mockResolvedValue('blocked');

      await expect(controller.validateOtp(body)).rejects.toMatchObject({
        status: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many failed attempts. Please try again later.',
      });
      expect(otpService.verifyOtp).not.toHaveBeenCalled();
    });

    it('should delete a valid OTP and reset failed attempts', async () => {
      redis.get.mockResolvedValue(null);
      otpService.verifyOtp.mockResolvedValue(true);

      await expect(controller.validateOtp(body)).resolves.toEqual({
        success: true,
        message: 'OTP is valid',
        data: { valid: true },
      });
      expect(otpService.verifyOtp).toHaveBeenCalledWith(
        body.email,
        body.otp,
        body.applicationId,
      );
      expect(otpService.deleteOtp).toHaveBeenCalledWith(
        body.email,
        body.applicationId,
      );
      expect(redis.del).toHaveBeenCalledWith(
        `failed_attempts:${body.email}:${body.applicationId}`,
      );
    });

    it('should record a failed attempt and reject an invalid OTP', async () => {
      redis.get.mockResolvedValueOnce(null).mockResolvedValueOnce('2');
      otpService.verifyOtp.mockResolvedValue(false);

      await expect(controller.validateOtp(body)).rejects.toThrow(
        new UnauthorizedException('Invalid OTP'),
      );
      expect(redis.set).toHaveBeenCalledWith(
        `failed_attempts:${body.email}:${body.applicationId}`,
        '3',
        300,
      );
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('should block after the fifth failed attempt and reset the counter', async () => {
      redis.get.mockResolvedValueOnce(null).mockResolvedValueOnce('4');
      otpService.verifyOtp.mockResolvedValue(false);

      await expect(controller.validateOtp(body)).rejects.toThrow(
        new UnauthorizedException('Invalid OTP'),
      );
      expect(redis.set).toHaveBeenNthCalledWith(
        1,
        `failed_attempts:${body.email}:${body.applicationId}`,
        '5',
        300,
      );
      expect(redis.set).toHaveBeenNthCalledWith(
        2,
        `block:${body.email}:${body.applicationId}`,
        'blocked',
        900,
      );
      expect(redis.del).toHaveBeenCalledWith(
        `failed_attempts:${body.email}:${body.applicationId}`,
      );
    });
  });
});
