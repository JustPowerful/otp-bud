import { ValidateTokenKeyGuard } from './validate-token-key.guard';

describe('ValidateTokenKeyGuard', () => {
  it('should be defined', () => {
    expect(new ValidateTokenKeyGuard()).toBeDefined();
  });
});
