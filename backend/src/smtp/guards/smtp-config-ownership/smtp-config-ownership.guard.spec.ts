import { SmtpConfigOwnershipGuard } from './smtp-config-ownership.guard';

describe('SmtpConfigOwnershipGuard', () => {
  it('should be defined', () => {
    expect(new SmtpConfigOwnershipGuard()).toBeDefined();
  });
});
