import { ApplicationOwnershipGuard } from './application-ownership.guard';

describe('ApplicationOwnershipGuard', () => {
  it('should be defined', () => {
    expect(new ApplicationOwnershipGuard()).toBeDefined();
  });
});
