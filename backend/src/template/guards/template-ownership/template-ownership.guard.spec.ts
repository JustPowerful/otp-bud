import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TemplateService } from 'src/template/template.service';
import { TemplateOwnershipGuard } from './template-ownership.guard';

const makeContext = (request: any) =>
  ({ switchToHttp: () => ({ getRequest: () => request }) }) as ExecutionContext;

describe('TemplateOwnershipGuard', () => {
  let guard: TemplateOwnershipGuard;
  let templateService: { userOwnsTemplate: jest.Mock };

  beforeEach(() => {
    templateService = { userOwnsTemplate: jest.fn() };
    guard = new TemplateOwnershipGuard(
      templateService as unknown as TemplateService,
    );
  });

  it('should authorize a template owned by the current user', async () => {
    templateService.userOwnsTemplate.mockResolvedValue(true);
    const request = {
      user: { id: 'user-id' },
      params: { templateId: 'template-id' },
      body: {},
      query: {},
    };

    await expect(guard.canActivate(makeContext(request))).resolves.toBe(true);
    expect(templateService.userOwnsTemplate).toHaveBeenCalledWith(
      'template-id',
      'user-id',
    );
  });

  it('should reject unauthenticated requests', async () => {
    expect(() =>
      guard.canActivate(makeContext({ params: {}, body: {}, query: {} })),
    ).toThrow(new UnauthorizedException('User not authenticated'));
    expect(templateService.userOwnsTemplate).not.toHaveBeenCalled();
  });

  it('should reject requests without a template ID', async () => {
    expect(() =>
      guard.canActivate(
        makeContext({
          user: { id: 'user-id' },
          params: {},
          body: {},
          query: {},
        }),
      ),
    ).toThrow(new UnauthorizedException('Template ID not provided'));
  });

  it.each([
    [
      'body',
      { params: {}, body: { templateId: 'body-template' }, query: {} },
      'body-template',
    ],
    [
      'query',
      { params: {}, body: {}, query: { templateId: 'query-template' } },
      'query-template',
    ],
  ])(
    'should read the template ID from the %s when params omit it',
    async (_source, fields, id) => {
      templateService.userOwnsTemplate.mockResolvedValue(true);

      await expect(
        guard.canActivate(makeContext({ user: { id: 'user-id' }, ...fields })),
      ).resolves.toBe(true);
      expect(templateService.userOwnsTemplate).toHaveBeenCalledWith(
        id,
        'user-id',
      );
    },
  );

  it('should return false when the service reports that the user does not own the template', async () => {
    templateService.userOwnsTemplate.mockResolvedValue(false);

    await expect(
      guard.canActivate(
        makeContext({
          user: { id: 'user-id' },
          params: { templateId: 'template-id' },
          body: {},
          query: {},
        }),
      ),
    ).resolves.toBe(false);
  });
});
