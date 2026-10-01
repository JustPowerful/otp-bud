jest.mock('marked', () => ({ marked: jest.fn((value: string) => value) }));

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApplicationOwnershipGuard } from 'src/application/guards/application-ownership/application-ownership.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { TemplateOwnershipGuard } from './guards/template-ownership/template-ownership.guard';

describe('TemplateController', () => {
  let controller: TemplateController;
  let templateService: {
    getTemplate: jest.Mock;
    setActiveTemplate: jest.Mock;
    createTemplate: jest.Mock;
    paginateTemplates: jest.Mock;
    removeTemplate: jest.Mock;
    updateTemplate: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    templateService = {
      getTemplate: jest.fn(),
      setActiveTemplate: jest.fn(),
      createTemplate: jest.fn(),
      paginateTemplates: jest.fn(),
      removeTemplate: jest.fn(),
      updateTemplate: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateController],
      providers: [{ provide: TemplateService, useValue: templateService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(TemplateOwnershipGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(ApplicationOwnershipGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();
    controller = module.get<TemplateController>(TemplateController);
  });

  it('should be defined', () => expect(controller).toBeDefined());

  describe('setActiveTemplate', () => {
    it('should activate an existing template for its application', async () => {
      const templateId = 'template-id';
      const current = { id: templateId, applicationId: 'application-id' };
      const active = { ...current, isActive: true };
      templateService.getTemplate.mockResolvedValue(current);
      templateService.setActiveTemplate.mockResolvedValue(active);

      await expect(controller.setActiveTemplate(templateId)).resolves.toEqual({
        success: true,
        data: active,
        message: 'Active template set successfully',
      });
      expect(templateService.getTemplate).toHaveBeenCalledWith(templateId);
      expect(templateService.setActiveTemplate).toHaveBeenCalledWith(
        current.applicationId,
        templateId,
      );
    });

    it('should throw when the template does not exist', async () => {
      templateService.getTemplate.mockResolvedValue(null);

      await expect(controller.setActiveTemplate('missing-id')).rejects.toThrow(
        new NotFoundException('Template not found'),
      );
      expect(templateService.setActiveTemplate).not.toHaveBeenCalled();
    });
  });

  it('should create a template', async () => {
    const applicationId = 'application-id';
    const body = { name: 'Welcome', subject: 'Hello', body: '<p>Hello</p>' };
    const template = { id: 'template-id', ...body, applicationId };
    templateService.createTemplate.mockResolvedValue(template);

    await expect(
      controller.createTemplate(applicationId, body),
    ).resolves.toEqual({
      success: true,
      data: template,
      message: 'Template created successfully',
    });
    expect(templateService.createTemplate).toHaveBeenCalledWith(
      applicationId,
      body,
    );
  });

  it('should return template details', async () => {
    const templateId = 'template-id';
    const template = { id: templateId, name: 'Welcome' };
    templateService.getTemplate.mockResolvedValue(template);

    await expect(controller.getTemplateDetails(templateId)).resolves.toEqual({
      success: true,
      data: template,
      message: 'Template details retrieved successfully',
    });
    expect(templateService.getTemplate).toHaveBeenCalledWith(templateId);
  });

  it('should return paginated templates and page metadata', async () => {
    const applicationId = 'application-id';
    const query = Object.assign(new PaginationDto(), { page: 2, limit: 5 });
    const data = [{ id: 'template-id', name: 'Welcome' }];
    templateService.paginateTemplates.mockResolvedValue({
      data,
      total: 12,
      page: 2,
      limit: 5,
      totalPages: 3,
    });

    await expect(
      controller.paginateTemplates(applicationId, query),
    ).resolves.toEqual({
      success: true,
      data,
      meta: {
        total: 12,
        page: 2,
        limit: 5,
        totalPages: 3,
        nextPage: 3,
        prevPage: 1,
      },
      message: 'Templates paginated successfully',
    });
    expect(templateService.paginateTemplates).toHaveBeenCalledWith(
      applicationId,
      query,
    );
  });

  it('should return null next and previous pages at the pagination boundaries', async () => {
    templateService.paginateTemplates.mockResolvedValue({
      data: [],
      total: 5,
      page: 1,
      limit: 5,
      totalPages: 1,
    });

    const result = await controller.paginateTemplates(
      'application-id',
      new PaginationDto(),
    );

    expect(result.meta).toEqual({
      total: 5,
      page: 1,
      limit: 5,
      totalPages: 1,
      nextPage: null,
      prevPage: null,
    });
  });

  it('should remove a template', async () => {
    const templateId = 'template-id';
    const template = { id: templateId, name: 'Welcome' };
    templateService.removeTemplate.mockResolvedValue(template);

    await expect(controller.removeTemplate(templateId)).resolves.toEqual({
      success: true,
      data: template,
      message: 'Template removed successfully',
    });
    expect(templateService.removeTemplate).toHaveBeenCalledWith(templateId);
  });

  it('should update a template', async () => {
    const templateId = 'template-id';
    const body = { name: 'Updated', subject: 'Updated subject' };
    const template = { id: templateId, ...body };
    templateService.updateTemplate.mockResolvedValue(template);

    await expect(controller.updateTemplate(templateId, body)).resolves.toEqual({
      success: true,
      data: template,
      message: 'Template updated successfully',
    });
    expect(templateService.updateTemplate).toHaveBeenCalledWith(
      templateId,
      body,
    );
  });
});
