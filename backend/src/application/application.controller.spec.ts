import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { ApplicationOwnershipGuard } from './guards/application-ownership/application-ownership.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let applicationService: {
    createApplication: jest.Mock;
    getApplication: jest.Mock;
    paginateApplications: jest.Mock;
    updateApplication: jest.Mock;
    removeApplication: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    applicationService = {
      createApplication: jest.fn(),
      getApplication: jest.fn(),
      paginateApplications: jest.fn(),
      updateApplication: jest.fn(),
      removeApplication: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        { provide: ApplicationService, useValue: applicationService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(ApplicationOwnershipGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();
    controller = module.get<ApplicationController>(ApplicationController);
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('should create an application for the authenticated user', async () => {
    const user = { id: 'user-id', email: 'user@example.com' };
    const body = {
      name: 'Demo',
      description: 'Demo application',
      emailId: 'smtp-id',
    };
    const application = { id: 'application-id', ...body, ownerId: user.id };
    applicationService.createApplication.mockResolvedValue(application);

    const result = await controller.createApplication(user, body);

    expect(applicationService.createApplication).toHaveBeenCalledWith(
      user.id,
      body,
    );
    expect(result).toEqual({
      success: true,
      data: application,
      message: 'Successfully created the application',
    });
  });

  it('should return application details', async () => {
    const applicationId = 'application-id';
    const application = { id: applicationId, name: 'Demo' };
    applicationService.getApplication.mockResolvedValue(application);

    await expect(
      controller.getApplicationDetails(applicationId),
    ).resolves.toEqual({
      success: true,
      data: application,
      message: 'Successfully retrieved the application details',
    });
    expect(applicationService.getApplication).toHaveBeenCalledWith(
      applicationId,
    );
  });

  it('should return paginated applications and page metadata', async () => {
    const user = { id: 'user-id', email: 'user@example.com' };
    const query = Object.assign(new PaginationDto(), { page: 2, limit: 5 });
    const applications = [{ id: 'application-id', name: 'Demo' }];
    applicationService.paginateApplications.mockResolvedValue({
      applications,
      total: 12,
      page: 2,
      limit: 5,
    });

    await expect(controller.paginateApplications(user, query)).resolves.toEqual(
      {
        success: true,
        data: applications,
        meta: { total: 12, page: 2, limit: 5, nextPage: 3, prevPage: 1 },
        message: 'Successfully paginated applications',
      },
    );
    expect(applicationService.paginateApplications).toHaveBeenCalledWith(
      user.id,
      query,
    );
  });

  it('should return null page links at the first and last page', async () => {
    applicationService.paginateApplications.mockResolvedValue({
      applications: [],
      total: 5,
      page: 1,
      limit: 5,
    });

    const result = await controller.paginateApplications(
      { id: 'user-id', email: 'user@example.com' },
      new PaginationDto(),
    );

    expect(result.meta).toEqual({
      total: 5,
      page: 1,
      limit: 5,
      nextPage: null,
      prevPage: null,
    });
  });

  it('should update an application', async () => {
    const applicationId = 'application-id';
    const body = { name: 'Updated demo' };
    const application = { id: applicationId, ...body };
    applicationService.updateApplication.mockResolvedValue(application);

    const result = await controller.updateApplication(applicationId, body);

    expect(applicationService.updateApplication).toHaveBeenCalledWith(
      applicationId,
      body,
    );
    expect(result).toEqual({
      success: true,
      data: application,
      message: 'Successfully updated the application',
    });
  });

  it('should remove an application', async () => {
    const applicationId = 'application-id';
    const application = { id: applicationId, name: 'Demo' };
    applicationService.removeApplication.mockResolvedValue(application);

    const result = await controller.removeApplication(applicationId);

    expect(applicationService.removeApplication).toHaveBeenCalledWith(
      applicationId,
    );
    expect(result).toEqual({
      success: true,
      data: application,
      message: 'Successfully removed the application',
    });
  });
});
