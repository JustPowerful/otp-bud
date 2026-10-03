jest.mock('marked', () => ({
  marked: jest.fn(
    (markdown: string) => `<p>${markdown}</p><script>alert(1)</script>`,
  ),
}));

import { marked } from 'marked';
import { TemplateBodySanitizerPipe } from './template-body-sanitizer.pipe';

describe('TemplateBodySanitizerPipe', () => {
  let pipe: TemplateBodySanitizerPipe;

  beforeEach(() => {
    jest.clearAllMocks();
    pipe = new TemplateBodySanitizerPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should render and sanitize the template body', async () => {
    const input = { name: 'Welcome', body: 'Hello user' };

    await expect(
      pipe.transform(input, { type: 'body', metatype: Object, data: '' }),
    ).resolves.toEqual({
      name: 'Welcome',
      body: '<p>Hello user</p>',
    });
    expect(marked).toHaveBeenCalledWith(input.body);
  });

  it('should return the value unchanged when the body is empty', async () => {
    const input = { name: 'Welcome', body: '' };

    await expect(
      pipe.transform(input, { type: 'body', metatype: Object, data: '' }),
    ).resolves.toEqual(input);
    expect(marked).not.toHaveBeenCalled();
  });

  it('should return the value unchanged when it is undefined', async () => {
    await expect(
      pipe.transform(undefined as never, {
        type: 'body',
        metatype: Object,
        data: '',
      }),
    ).resolves.toBeUndefined();
  });
});
