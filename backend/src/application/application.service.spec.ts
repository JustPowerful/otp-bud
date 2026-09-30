jest.mock('src/lib/prisma');

import { Test, TestingModule } from '@nestjs/testing';
import { prisma } from 'src/lib/prisma';
import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let service: ApplicationService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationService],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateOwnership', () => {
    it('should return true when the user owns the application', async () => {
      const applicationId = 'application-id';
      const userId = 'user-id';
      jest.mocked(prisma.application.findFirst).mockResolvedValue({
        id: applicationId,
      } as never);

      const result = await service.validateOwnership(applicationId, userId);

      expect(prisma.application.findFirst).toHaveBeenCalledWith({
        where: { id: applicationId, ownerId: userId },
      });
      expect(result).toBe(true);
    });

    it('should return false when the user does not own the application', async () => {
      const applicationId = 'application-id';
      const userId = 'user-id';
      jest.mocked(prisma.application.findFirst).mockResolvedValue(null);

      const result = await service.validateOwnership(applicationId, userId);

      expect(prisma.application.findFirst).toHaveBeenCalledWith({
        where: { id: applicationId, ownerId: userId },
      });
      expect(result).toBe(false);
    });
  });

  describe('getApplication', () => {
    it('should return the application when it exists', async () => {
      const applicationId = 'application-id';
      const mockApplication = { id: applicationId, name: 'Test application' };
      jest
        .mocked(prisma.application.findUnique)
        .mockResolvedValue(mockApplication as never);

      const result = await service.getApplication(applicationId);

      expect(prisma.application.findUnique).toHaveBeenCalledWith({
        where: { id: applicationId },
      });
      expect(result).toEqual(mockApplication);
    });

    it('should return null when the application does not exist', async () => {
      const applicationId = 'missing-application-id';
      jest.mocked(prisma.application.findUnique).mockResolvedValue(null);

      const result = await service.getApplication(applicationId);

      expect(prisma.application.findUnique).toHaveBeenCalledWith({
        where: { id: applicationId },
      });
      expect(result).toBeNull();
    });
  });

  describe('createApplication', () => {
    it('should create an application for the owner', async () => {
      const ownerId = 'user-id';
      const createApplicationDto = {
        name: 'Test application',
        description: 'A test application',
        picture: 'picture.png',
        emailId: 'email-id',
      };
      const mockApplication = {
        id: 'application-id',
        ownerId,
        ...createApplicationDto,
      };
      jest
        .mocked(prisma.application.create)
        .mockResolvedValue(mockApplication as never);

      const result = await service.createApplication(
        ownerId,
        createApplicationDto,
      );

      expect(prisma.application.create).toHaveBeenCalledWith({
        data: { ...createApplicationDto, ownerId },
      });
      expect(result).toEqual(mockApplication);
    });
  });

  describe('paginateApplications', () => {
    it('should return a page of applications matching the search query', async () => {
      const ownerId = 'user-id';
      const paginationDto = { page: 2, limit: 5, query: 'demo', skip: 5 };
      const mockApplications = [{ id: 'application-id', name: 'Demo app' }];
      jest
        .mocked(prisma.application.findMany)
        .mockResolvedValue(mockApplications as never);
      jest.mocked(prisma.application.count).mockResolvedValue(1);

      const result = await service.paginateApplications(ownerId, paginationDto);

      const where = {
        ownerId,
        OR: [
          { name: { contains: 'demo', mode: 'insensitive' } },
          { description: { contains: 'demo', mode: 'insensitive' } },
        ],
      };
      expect(prisma.application.findMany).toHaveBeenCalledWith({
        where,
        skip: 5,
        take: 5,
      });
      expect(prisma.application.count).toHaveBeenCalledWith({ where });
      expect(result).toEqual({
        applications: mockApplications,
        total: 1,
        page: 2,
        limit: 5,
      });
    });

    it('should return a page without a search filter when no query is provided', async () => {
      const ownerId = 'user-id';
      const paginationDto = { page: 1, limit: 10, skip: 0 };
      const mockApplications = [{ id: 'application-id', name: 'My app' }];
      jest
        .mocked(prisma.application.findMany)
        .mockResolvedValue(mockApplications as never);
      jest.mocked(prisma.application.count).mockResolvedValue(1);

      const result = await service.paginateApplications(ownerId, paginationDto);

      expect(prisma.application.findMany).toHaveBeenCalledWith({
        where: { ownerId },
        skip: 0,
        take: 10,
      });
      expect(prisma.application.count).toHaveBeenCalledWith({
        where: { ownerId },
      });
      expect(result).toEqual({
        applications: mockApplications,
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('updateApplication', () => {
    it('should update an application', async () => {
      const applicationId = 'application-id';
      const updateDto = { name: 'Updated application' };
      const mockApplication = { id: applicationId, ...updateDto };
      jest
        .mocked(prisma.application.update)
        .mockResolvedValue(mockApplication as never);

      const result = await service.updateApplication(applicationId, updateDto);

      expect(prisma.application.update).toHaveBeenCalledWith({
        where: { id: applicationId },
        data: updateDto,
      });
      expect(result).toEqual(mockApplication);
    });

    it('should throw when neither name nor email configuration is provided', async () => {
      await expect(
        service.updateApplication('application-id', { description: 'Changed' }),
      ).rejects.toThrow(
        'Name and email config are required to update the application.',
      );
      expect(prisma.application.update).not.toHaveBeenCalled();
    });
  });

  describe('removeApplication', () => {
    it('should delete and return the application', async () => {
      const applicationId = 'application-id';
      const mockApplication = { id: applicationId, name: 'Test application' };
      jest
        .mocked(prisma.application.delete)
        .mockResolvedValue(mockApplication as never);

      const result = await service.removeApplication(applicationId);

      expect(prisma.application.delete).toHaveBeenCalledWith({
        where: { id: applicationId },
      });
      expect(result).toEqual(mockApplication);
    });

    it('should propagate an error when deletion fails', async () => {
      jest
        .mocked(prisma.application.delete)
        .mockRejectedValue(new Error('Application not found'));

      await expect(
        service.removeApplication('missing-application-id'),
      ).rejects.toThrow('Application not found');
    });
  });
});
