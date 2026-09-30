jest.mock('src/lib/prisma');

import { Test, TestingModule } from '@nestjs/testing';
import { SmtpService } from './smtp.service';
import { prisma } from 'src/lib/prisma';
describe('SmtpService', () => {
  let service: SmtpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmtpService],
    }).compile();

    service = module.get<SmtpService>(SmtpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('userOwnsSmtpConfig', () => {
    it('should return true if the user is the owner of the SMTP configuration', async () => {
      const smtpConfigId = 'smtp-config-id';
      const userId = 'user-id';

      const mockSmtpConfig = {
        id: smtpConfigId,
        userId: userId,
        smtpService: 'smtp-service',
        smtpUser: 'smtp-user',
        smtpPassword: 'smtp-password',
        smtpPort: 587,
      };

      jest.mocked(prisma.email.findUnique).mockResolvedValue(mockSmtpConfig);

      const result = await service.userOwnsSmtpConfig(smtpConfigId, userId);

      expect(prisma.email.findUnique).toHaveBeenCalledWith({
        where: {
          id: smtpConfigId,
          userId,
        },
      });

      expect(result).toBe(true);
    });

    it('should return false if the user is not the owner of the SMTP configuration', async () => {
      const smtpConfigId = 'smtp-config-id';
      const userId = 'user-id';

      jest.mocked(prisma.email.findUnique).mockResolvedValue(null);

      const result = await service.userOwnsSmtpConfig(smtpConfigId, userId);

      expect(prisma.email.findUnique).toHaveBeenCalledWith({
        where: {
          id: smtpConfigId,
          userId,
        },
      });

      expect(result).toBe(false);
    });
  });

  describe('addSmtpConfiguration', () => {
    it('should create a new SMTP configuration for the user', async () => {
      const userId = 'user-id';
      const smtpDto = {
        smtpService: 'smtp-service',
        smtpUser: 'smtp-user',
        smtpPassword: 'smtp-password',
        smtpPort: '587',
      };

      const mockSmtpConfig = {
        id: 'smtp-config-id',
        userId: userId,
        smtpService: smtpDto.smtpService,
        smtpUser: smtpDto.smtpUser,
        smtpPassword: smtpDto.smtpPassword,
        smtpPort: parseInt(smtpDto.smtpPort, 10),
      };

      jest.mocked(prisma.email.create).mockResolvedValue(mockSmtpConfig);

      const result = await service.addSmtpConfiguration(userId, smtpDto);

      expect(prisma.email.create).toHaveBeenCalledWith({
        data: {
          userId,
          smtpService: smtpDto.smtpService,
          smtpUser: smtpDto.smtpUser,
          smtpPassword: smtpDto.smtpPassword,
          smtpPort: parseInt(smtpDto.smtpPort, 10),
        },
      });

      expect(result).toEqual(mockSmtpConfig);
    });

    describe('updateSmtpConfiguration', () => {
      it('should update an existing SMTP Configuration for the user', async () => {
        const smtpConfigId = 'smtp-config-id';
        const smtpDto = {
          smtpService: 'updated-smtp-service',
          smtpUser: 'updated-smtp-user',
          smtpPassword: 'updated-smtp-password',
          smtpPort: '465',
        };

        const mockSmtpConfig = {
          id: smtpConfigId,
          userId: 'user-id',
          smtpService: smtpDto.smtpService,
          smtpUser: smtpDto.smtpUser,
          smtpPassword: smtpDto.smtpPassword,
          smtpPort: parseInt(smtpDto.smtpPort, 10),
        };

        jest.mocked(prisma.email.update).mockResolvedValue(mockSmtpConfig);

        const result = await service.updateSmtpConfiguration(
          smtpConfigId,
          smtpDto,
        );

        expect(prisma.email.update).toHaveBeenCalledWith({
          where: {
            id: smtpConfigId,
          },
          data: {
            smtpService: smtpDto.smtpService,
            smtpUser: smtpDto.smtpUser,
            smtpPassword: smtpDto.smtpPassword,
            smtpPort: parseInt(smtpDto.smtpPort, 10),
          },
        });

        expect(result).toEqual(mockSmtpConfig);
      });
      it('should throw an error if the SMTP configuration does not exist', async () => {
        const smtpConfigId = 'non-existent-smtp-config-id';
        const smtpDto = {
          smtpService: 'updated-smtp-service',
          smtpUser: 'updated-smtp-user',
          smtpPassword: 'updated-smtp-password',
          smtpPort: '465',
        };

        jest
          .mocked(prisma.email.update)
          .mockRejectedValue(new Error('SMTP configuration not found'));

        await expect(
          service.updateSmtpConfiguration(smtpConfigId, smtpDto),
        ).rejects.toThrow('SMTP configuration not found');

        expect(prisma.email.update).toHaveBeenCalledWith({
          where: {
            id: smtpConfigId,
          },
          data: {
            smtpService: smtpDto.smtpService,
            smtpUser: smtpDto.smtpUser,
            smtpPassword: smtpDto.smtpPassword,
            smtpPort: parseInt(smtpDto.smtpPort, 10),
          },
        });
      });
    });

    describe('getSmtpConfigurations', () => {
      it('should return all SMTP configurations for the user', async () => {
        const userId = 'user-id';

        const mockSmtpConfigs = [
          {
            id: 'smtp-config-id-1',
            userId: userId,
            smtpService: 'smtp-service-1',
            smtpUser: 'smtp-user-1',
            smtpPassword: 'smtp-password-1',
            smtpPort: 587,
          },
          {
            id: 'smtp-config-id-2',
            userId: userId,
            smtpService: 'smtp-service-2',
            smtpUser: 'smtp-user-2',
            smtpPassword: 'smtp-password-2',
            smtpPort: 465,
          },
        ];

        jest.mocked(prisma.email.findMany).mockResolvedValue(mockSmtpConfigs);

        const result = await service.getSmtpConfigurations(userId);

        expect(prisma.email.findMany).toHaveBeenCalledWith({
          where: {
            userId: userId,
          },
        });

        expect(result).toEqual(mockSmtpConfigs);
      });
    });

    describe('deleteSmtpConfiguration', () => {
      it('should delete the SMTP configuration for the user', async () => {
        const smtpConfigId = 'smtp-config-id';

        const mockSmtpConfig = {
          id: smtpConfigId,
          userId: 'user-id',
          smtpService: 'smtp-service',
          smtpUser: 'smtp-user',
          smtpPassword: 'smtp-password',
          smtpPort: 587,
        };

        jest.mocked(prisma.email.delete).mockResolvedValue(mockSmtpConfig);

        const result = await service.deleteSmtpConfiguration(smtpConfigId);

        expect(prisma.email.delete).toHaveBeenCalledWith({
          where: {
            id: smtpConfigId,
          },
        });

        expect(result).toEqual(mockSmtpConfig);
      });

      it('should throw a specific error when the configuration is in use', async () => {
        const smtpConfigId = 'non-existent-smtp-config-id';
        const error = Object.assign(new Error('Foreign key constraint'), {
          code: 'P2003',
        });

        jest.mocked(prisma.email.delete).mockRejectedValue(error);

        await expect(
          service.deleteSmtpConfiguration(smtpConfigId),
        ).rejects.toThrow(
          'Cannot delete this SMTP configuration because it is being used in another table.',
        );

        expect(prisma.email.delete).toHaveBeenCalledWith({
          where: {
            id: smtpConfigId,
          },
        });
      });

      it('should throw a generic error for other deletion failures', async () => {
        const smtpConfigId = 'smtp-config-id';

        jest
          .mocked(prisma.email.delete)
          .mockRejectedValue(new Error('Database unavailable'));

        await expect(
          service.deleteSmtpConfiguration(smtpConfigId),
        ).rejects.toThrow(
          'An error occurred while deleting the SMTP configuration.',
        );

        expect(prisma.email.delete).toHaveBeenCalledWith({
          where: {
            id: smtpConfigId,
          },
        });
      });
    });
  });
});
