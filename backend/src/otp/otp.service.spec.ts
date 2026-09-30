jest.mock('src/lib/prisma');

import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { prisma } from 'src/lib/prisma';

describe('OtpService', () => {
  let service: OtpService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpService],
    }).compile();

    service = module.get<OtpService>(OtpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateOtp', () => {
    it('should generate and save a six-digit OTP', async () => {
      const expiresAt = new Date('2030-01-01T00:00:00.000Z');
      const email = 'user@example.com';
      const applicationId = 'application-id';
      const mockOtp = {
        id: 'otp-id',
        otp: '123456',
        email,
        applicationId,
        expiresAt,
      };

      jest.mocked(prisma.otp.create).mockResolvedValue(mockOtp);

      const result = await service.generateOtp(expiresAt, email, applicationId);

      expect(prisma.otp.create).toHaveBeenCalledWith({
        data: {
          otp: expect.stringMatching(/^\d{6}$/),
          email,
          application: { connect: { id: applicationId } },
          expiresAt,
        },
      });
      expect(result).toEqual(mockOtp);
    });
  });

  describe('verifyOtp', () => {
    it('should return true when a matching, unexpired OTP exists', async () => {
      const email = 'user@example.com';
      const otp = '123456';
      const applicationId = 'application-id';
      jest.mocked(prisma.otp.findFirst).mockResolvedValue({
        id: 'otp-id',
        otp,
        email,
        applicationId,
        expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      });

      const result = await service.verifyOtp(email, otp, applicationId);

      expect(prisma.otp.findFirst).toHaveBeenCalledWith({
        where: {
          email,
          otp,
          applicationId,
          expiresAt: { gt: expect.any(Date) },
        },
      });
      expect(result).toBe(true);
    });

    it('should return false when no matching, unexpired OTP exists', async () => {
      const email = 'user@example.com';
      const otp = '123456';
      const applicationId = 'application-id';
      jest.mocked(prisma.otp.findFirst).mockResolvedValue(null);

      const result = await service.verifyOtp(email, otp, applicationId);

      expect(prisma.otp.findFirst).toHaveBeenCalledWith({
        where: {
          email,
          otp,
          applicationId,
          expiresAt: { gt: expect.any(Date) },
        },
      });
      expect(result).toBe(false);
    });
  });

  describe('deleteOtp', () => {
    it('should delete OTP records for the email and application', async () => {
      const email = 'user@example.com';
      const applicationId = 'application-id';

      await service.deleteOtp(email, applicationId);

      expect(prisma.otp.deleteMany).toHaveBeenCalledWith({
        where: { email, applicationId },
      });
    });
  });
});
