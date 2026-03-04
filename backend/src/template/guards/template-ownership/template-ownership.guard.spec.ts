import { TemplateOwnershipGuard } from './template-ownership.guard';

describe('TemplateOwnershipGuard', () => {
  it('should be defined', () => {
    expect(new TemplateOwnershipGuard()).toBeDefined();
  });
});
