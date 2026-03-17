import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

type TemplatePayload = CreateTemplateDto | UpdateTemplateDto;

@Injectable()
export class TemplateBodySanitizerPipe implements PipeTransform<TemplatePayload> {
  async transform(value: TemplatePayload, metadata: ArgumentMetadata) {
    if (value?.body) {
      const formattedBody = marked(value.body);
      const sanitizedBody = sanitizeHtml(formattedBody);
      return {
        ...value,
        body: sanitizedBody,
      };
    }
    return value;
  }
}
