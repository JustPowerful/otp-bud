import { TokenOwnershipGuard } from './token-ownership.guard';

describe('TokenOwnershipGuard', () => {
  it('should be defined', () => {
    expect(new TokenOwnershipGuard()).toBeDefined();
  });
});
