import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateOwnershipGuard } from './guards/template-ownership/template-ownership.guard';
import { ApplicationOwnershipGuard } from 'src/application/guards/application-ownership/application-ownership.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @ApiBearerAuth('access-token')
  @Patch('activate/:templateId')
  @UseGuards(AuthGuard, TemplateOwnershipGuard)
  async setActiveTemplate(@Param('templateId') templateId: string) {
    const currentTemplate = await this.templateService.getTemplate(templateId);
    if (!currentTemplate) throw new NotFoundException('Template not found');
    const template = await this.templateService.setActiveTemplate(
      currentTemplate?.applicationId || '',
      templateId,
    );
    return new SuccessResponseDto({
      data: template,
      message: 'Active template set successfully',
    });
  }

  // The token injector for swagger
  @ApiBearerAuth('access-token')
  @Post('create/:applicationId')
  @UseGuards(AuthGuard, ApplicationOwnershipGuard)
  async createTemplate(
    @Param('applicationId') applicationId: string,
    @Body() createTemplateDto: CreateTemplateDto,
  ) {
    const template = await this.templateService.createTemplate(
      applicationId,
      createTemplateDto,
    );
    return new SuccessResponseDto({
      data: template,
      message: 'Template created successfully',
    });
  }

  @ApiBearerAuth('access-token')
  @Get('/details/:templateId')
  @UseGuards(AuthGuard, TemplateOwnershipGuard)
  async getTemplateDetails(@Param('templateId') templateId: string) {
    const template = await this.templateService.getTemplate(templateId);
    return new SuccessResponseDto({
      data: template,
      message: 'Template details retrieved successfully',
    });
  }

  @ApiBearerAuth('access-token')
  @Get('paginate/:applicationId')
  @UseGuards(AuthGuard, ApplicationOwnershipGuard)
  async paginateTemplates(
    @Param('applicationId') applicationId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const { data, limit, page, total, totalPages } =
      await this.templateService.paginateTemplates(
        applicationId,
        paginationDto,
      );
    return new SuccessResponseDto({
      data: data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
      message: 'Templates paginated successfully',
    });
  }

  @ApiBearerAuth('access-token')
  @Delete('remove/:templateId')
  @UseGuards(AuthGuard, TemplateOwnershipGuard)
  async removeTemplate(@Param('templateId') templateId: string) {
    const template = await this.templateService.removeTemplate(templateId);
    return new SuccessResponseDto({
      data: template,
      message: 'Template removed successfully',
    });
  }

  @ApiBearerAuth('access-token')
  @Patch('update/:templateId')
  @UseGuards(AuthGuard, TemplateOwnershipGuard)
  async updateTemplate(
    @Param('templateId') templateId: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    const template = await this.templateService.updateTemplate(
      templateId,
      updateTemplateDto,
    );
    return new SuccessResponseDto({
      data: template,
      message: 'Template updated successfully',
    });
  }
}
