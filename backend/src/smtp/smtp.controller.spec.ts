import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/auth/auth.guard';
import { SmtpService } from './smtp.service';
import { SmtpController } from './smtp.controller';
import { SmtpConfigOwnershipGuard } from './guards/smtp-config-ownership/smtp-config-ownership.guard';

describe('SmtpController', () => {
  let controller: SmtpController;
  let smtpService: {
    getSmtpConfigurations: jest.Mock;
    updateSmtpConfiguration: jest.Mock;
    deleteSmtpConfiguration: jest.Mock;
    addSmtpConfiguration: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    smtpService = {
      getSmtpConfigurations: jest.fn(),
      updateSmtpConfiguration: jest.fn(),
      deleteSmtpConfiguration: jest.fn(),
      addSmtpConfiguration: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmtpController],
      providers: [{ provide: SmtpService, useValue: smtpService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(SmtpConfigOwnershipGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();
    controller = module.get<SmtpController>(SmtpController);
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('should return the authenticated user SMTP configurations', async () => {
    const user = { id: 'user-id', email: 'user@example.com' };
    const configs = [{ id: 'smtp-id', smtpService: 'Example SMTP' }];
    smtpService.getSmtpConfigurations.mockResolvedValue(configs);

    await expect(controller.getAllSmtpConfigs(user)).resolves.toEqual({
      data: configs,
      message: 'Successfully retrieved all SMTP configurations',
    });
    expect(smtpService.getSmtpConfigurations).toHaveBeenCalledWith(user.id);
  });

  it('should update an SMTP configuration', async () => {
    const user = { id: 'user-id', email: 'user@example.com' };
    const body = {
      smtpId: 'smtp-id',
      smtpService: 'Example SMTP',
      smtpUser: 'account',
      smtpPassword: 'secret',
      smtpPort: '587',
    };
    const updated = { id: body.smtpId, smtpService: body.smtpService };
    smtpService.updateSmtpConfiguration.mockResolvedValue(updated);

    await expect(
      controller.updateSmtpConfig(user, body, body.smtpId),
    ).resolves.toEqual({
      data: updated,
      message: 'Successfully updated the SMTP configuration',
    });
    expect(smtpService.updateSmtpConfiguration).toHaveBeenCalledWith(
      body.smtpId,
      body,
    );
  });

  it('should delete an SMTP configuration', async () => {
    const smtpId = 'smtp-id';
    smtpService.deleteSmtpConfiguration.mockResolvedValue(undefined);

    await expect(
      controller.deleteSmtpConfig(
        { id: 'user-id', email: 'user@example.com' },
        smtpId,
      ),
    ).resolves.toEqual({
      message: 'Successfully deleted the SMTP configuration',
    });
    expect(smtpService.deleteSmtpConfiguration).toHaveBeenCalledWith(smtpId);
  });

  it('should create an SMTP configuration for the authenticated user', async () => {
    const user = { id: 'user-id', email: 'user@example.com' };
    const body = {
      smtpService: 'Example SMTP',
      smtpUser: 'account',
      smtpPassword: 'secret',
      smtpPort: '587',
    };
    const config = { id: 'smtp-id', ...body };
    smtpService.addSmtpConfiguration.mockResolvedValue(config);

    await expect(controller.createSmtpConfig(body, user)).resolves.toEqual({
      data: config,
      message: 'Successfully added the SMTP configuration',
    });
    expect(smtpService.addSmtpConfiguration).toHaveBeenCalledWith(
      user.id,
      body,
    );
  });
});
