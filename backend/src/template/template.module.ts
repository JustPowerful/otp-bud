import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { ApplicationOwnershipGuard } from 'src/application/guards/application-ownership/application-ownership.guard';
import { ApplicationService } from 'src/application/application.service';
import { TemplateBodySanitizerPipe } from './pipes/template-body-sanitizer.pipe';

@Module({
  providers: [TemplateService, ApplicationService, TemplateBodySanitizerPipe],
  controllers: [TemplateController],
  exports: [TemplateService],
})
export class TemplateModule {}
