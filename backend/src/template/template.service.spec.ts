jest.mock('src/lib/prisma');
import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from './template.service';
import { prisma } from 'src/lib/prisma';
import { PaginationDto } from 'src/common/dto/pagination.dto';

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateService],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('userOwnsTemplate', () => {
    it('should return true if the user owns the template', async () => {
      const templateId = 'template-id';
      const userId = 'user-id';
      // Mock the prisma.template.findUnique method
      const mockTemplate = {
        id: templateId,
        name: 'Test Template',
        subject: 'Test Subject',
        body: 'Test Body',
        applicationId: 'app-id',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.mocked(prisma.template.findUnique).mockResolvedValue(mockTemplate);

      const result = await service.userOwnsTemplate(templateId, userId);

      expect(prisma.template.findUnique).toHaveBeenCalledWith({
        where: {
          id: templateId,
          application: {
            ownerId: userId,
          },
        },
      });

      expect(result).toBe(true);
    });

    it('should return false if the user does not own the template', async () => {
      const templateId = 'template-id';
      const userId = 'user-id';

      // Mock the prisma.template.findUnique method to return null
      jest.mocked(prisma.template.findUnique).mockResolvedValue(null);

      const result = await service.userOwnsTemplate(templateId, userId);

      expect(prisma.template.findUnique).toHaveBeenCalledWith({
        where: {
          id: templateId,
          application: {
            ownerId: userId,
          },
        },
      });

      expect(result).toBe(false);
    });
  });

  describe('setActiveTemplate', () => {
    it('should set the specified template as active and deactivate others for the application', async () => {
      const applicationId = 'app-id';
      const templateId = 'template-id';

      const mockUpdatedTemplate = {
        id: templateId,
        name: 'Test Template',
        subject: 'Test Subject',
        body: 'Test Body',
        applicationId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.mocked(prisma.template.updateMany).mockResolvedValue({ count: 1 });
      jest
        .mocked(prisma.template.update)
        .mockResolvedValue(mockUpdatedTemplate);

      const result = await service.setActiveTemplate(applicationId, templateId);

      expect(prisma.template.updateMany).toHaveBeenCalledWith({
        where: {
          applicationId,
        },
        data: {
          isActive: false,
        },
      });

      expect(prisma.template.update).toHaveBeenCalledWith({
        where: {
          id: templateId,
        },
        data: {
          isActive: true,
        },
      });

      expect(result).toEqual(mockUpdatedTemplate);
    });

    it('should throw an error if the template does not exist', async () => {
      const applicationId = 'app-id';
      const templateId = 'non-existent-template-id';

      jest.mocked(prisma.template.updateMany).mockResolvedValue({ count: 1 });
      jest
        .mocked(prisma.template.update)
        .mockRejectedValue(new Error('Template not found'));

      await expect(
        service.setActiveTemplate(applicationId, templateId),
      ).rejects.toThrow('Template not found');
    });
  });

  describe('createTemplate', () => {
    it('should create a new template and set it as active if no other active templates exist', async () => {
      const applicationId = 'app-id';
      const createTemplateDto = {
        name: 'New Template',
        subject: 'New Subject',
        body: 'New Body',
      };

      const mockCreatedTemplate = {
        id: 'new-template-id',
        ...createTemplateDto,
        applicationId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.mocked(prisma.template.findFirst).mockResolvedValue(null);
      jest
        .mocked(prisma.template.create)
        .mockResolvedValue(mockCreatedTemplate);

      const result = await service.createTemplate(
        applicationId,
        createTemplateDto,
      );

      expect(prisma.template.findFirst).toHaveBeenCalledWith({
        where: {
          applicationId,
          isActive: true,
        },
      });

      expect(prisma.template.create).toHaveBeenCalledWith({
        data: {
          ...createTemplateDto,
          applicationId,
          isActive: true,
        },
      });

      expect(result).toEqual(mockCreatedTemplate);
    });

    it('should create a new template and keep it inactive if another active template exists', async () => {
      const applicationId = 'app-id';
      const createTemplateDto = {
        name: 'New Template',
        subject: 'New Subject',
        body: 'New Body',
      };

      const mockActiveTemplate = {
        id: 'active-template-id',
        name: 'Active Template',
        subject: 'Active Subject',
        body: 'Active Body',
        applicationId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCreatedTemplate = {
        id: 'new-template-id',
        ...createTemplateDto,
        applicationId,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .mocked(prisma.template.findFirst)
        .mockResolvedValue(mockActiveTemplate);
      jest
        .mocked(prisma.template.create)
        .mockResolvedValue(mockCreatedTemplate);

      const result = await service.createTemplate(
        applicationId,
        createTemplateDto,
      );

      expect(prisma.template.findFirst).toHaveBeenCalledWith({
        where: {
          applicationId,
          isActive: true,
        },
      });

      expect(prisma.template.create).toHaveBeenCalledWith({
        data: {
          ...createTemplateDto,
          applicationId,
          isActive: false,
        },
      });

      expect(result).toEqual(mockCreatedTemplate);
      expect(result.isActive).toBe(false); // Ensure the new template is inactive
    });
  });

  describe('getTemplate', () => {
    it('should return the template data if it exists', async () => {
      const templateId = 'template-id';
      const mockTemplate = {
        id: templateId,
        name: 'Test Template',
        subject: 'Test Subject',
        body: 'Test Body',
        applicationId: 'app-id',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.mocked(prisma.template.findUnique).mockResolvedValue(mockTemplate);

      const result = await service.getTemplate(templateId);

      expect(prisma.template.findUnique).toHaveBeenCalledWith({
        where: {
          id: templateId,
        },
      });

      expect(result).toEqual(mockTemplate);
    });
    it('should return null if the template does not exist', async () => {
      const templateId = 'non-existent-template-id';

      jest.mocked(prisma.template.findUnique).mockResolvedValue(null);

      const result = await service.getTemplate(templateId);

      expect(prisma.template.findUnique).toHaveBeenCalledWith({
        where: {
          id: templateId,
        },
      });

      expect(result).toBeNull();
    });
  });

  describe('removeTemplate', () => {
    it('should remove the template and return the removed template data', async () => {
      const templateId = 'template-id';
      const mockRemovedTemplate = {
        id: templateId,
        name: 'Test Template',
        subject: 'Test Subject',
        body: 'Test Body',
        applicationId: 'app-id',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .mocked(prisma.template.delete)
        .mockResolvedValue(mockRemovedTemplate);

      const result = await service.removeTemplate(templateId);

      expect(prisma.template.delete).toHaveBeenCalledWith({
        where: {
          id: templateId,
        },
      });

      expect(result).toEqual(mockRemovedTemplate);
    });
    it('should throw an error if the template does not exist', async () => {
      const templateId = 'non-existent-template-id';

      jest
        .mocked(prisma.template.delete)
        .mockRejectedValue(new Error('Template not found'));

      await expect(service.removeTemplate(templateId)).rejects.toThrow(
        'Template not found',
      );
    });
  });

  describe('updateTemplate', () => {
    it('should update the template and return the updated template data', async () => {
      const templateId = 'template-id';
      const updateTemplateDto = {
        name: 'Updated Template',
        subject: 'Updated Subject',
        body: 'Updated Body',
      };

      const mockUpdatedTemplate = {
        id: templateId,
        ...updateTemplateDto,
        applicationId: 'app-id',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .mocked(prisma.template.update)
        .mockResolvedValue(mockUpdatedTemplate);

      const result = await service.updateTemplate(
        templateId,
        updateTemplateDto,
      );

      expect(prisma.template.update).toHaveBeenCalledWith({
        where: {
          id: templateId,
        },
        data: updateTemplateDto,
      });

      expect(result).toEqual(mockUpdatedTemplate);
    });
    it('should throw an error if the template does not exist', async () => {
      const templateId = 'non-existent-template-id';
      const updateTemplateDto = {
        name: 'Updated Template',
        subject: 'Updated Subject',
        body: 'Updated Body',
      };

      jest
        .mocked(prisma.template.update)
        .mockRejectedValue(new Error('Template not found'));

      await expect(
        service.updateTemplate(templateId, updateTemplateDto),
      ).rejects.toThrow('Template not found');
    });
  });

  describe('paginateTemplates', () => {
    it('should return paginated templates with total count', async () => {
      const applicationId = 'app-id';
      const page = 1;
      const limit = 5;
      const skip = 0;
      const query = 'test';
      const mockTemplates = [
        {
          id: 'template-id-1',
          name: 'Test Template 1',
          subject: 'Test Subject 1',
          body: 'Test Body 1',
          applicationId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'template-id-2',
          name: 'Test Template 2',
          subject: 'Test Subject 2',
          body: 'Test Body 2',
          applicationId,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const mockTotal = 2;

      // Set the mock implementation for prisma.template.findMany and prisma.template.count to return the mock data
      jest.mocked(prisma.template.findMany).mockResolvedValue(mockTemplates);
      jest.mocked(prisma.template.count).mockResolvedValue(mockTotal);

      const result = await service.paginateTemplates(applicationId, {
        page,
        limit,
        query,
        skip,
      });

      expect(prisma.template.findMany).toHaveBeenCalledWith({
        where: {
          applicationId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { subject: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take: limit,
      });

      expect(prisma.template.count).toHaveBeenCalledWith({
        where: {
          applicationId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { subject: { contains: query, mode: 'insensitive' } },
          ],
        },
      });

      expect(result).toEqual({
        data: mockTemplates,
        total: mockTotal,
        page,
        limit,
        totalPages: Math.ceil(mockTotal / limit),
      });
    });

    it('should use default pagination values when none are provided', async () => {
      jest.mocked(prisma.template.findMany).mockResolvedValue([]);
      jest.mocked(prisma.template.count).mockResolvedValue(0);

      const result = await service.paginateTemplates('app-id', new PaginationDto());

      expect(prisma.template.findMany).toHaveBeenCalledWith({
        where: { applicationId: 'app-id' },
        skip: 0,
        take: 5,
      });
      expect(prisma.template.count).toHaveBeenCalledWith({
        where: { applicationId: 'app-id' },
      });
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 5,
        totalPages: 0,
      });
    });
  });

  describe('getActiveTemplate', () => {
    it('should return the active template for the given application ID', async () => {
      const applicationId = 'app-id';
      const mockActiveTemplate = {
        id: 'active-template-id',
        name: 'Active Template',
        subject: 'Active Subject',
        body: 'Active Body',
        applicationId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .mocked(prisma.template.findFirst)
        .mockResolvedValue(mockActiveTemplate);

      const result = await service.getActiveTemplate(applicationId);

      expect(prisma.template.findFirst).toHaveBeenCalledWith({
        where: {
          applicationId,
          isActive: true,
        },
      });

      expect(result).toEqual(mockActiveTemplate);
    });
    it('should return null if no active template exists for the given application ID', async () => {
      const applicationId = 'app-id';

      jest.mocked(prisma.template.findFirst).mockResolvedValue(null);

      const result = await service.getActiveTemplate(applicationId);

      expect(prisma.template.findFirst).toHaveBeenCalledWith({
        where: {
          applicationId,
          isActive: true,
        },
      });

      expect(result).toBeNull();
    });
  });
});
