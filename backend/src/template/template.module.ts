import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { ApplicationOwnershipGuard } from 'src/application/guards/application-ownership/application-ownership.guard';
import { ApplicationService } from 'src/application/application.service';

@Module({
  providers: [TemplateService, ApplicationService],
  controllers: [TemplateController],
  exports: [TemplateService],
})
export class TemplateModule {}
