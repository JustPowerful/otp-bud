import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/express';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationService } from './application.service';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { ApplicationOwnershipGuard } from './guards/application-ownership/application-ownership.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @ApiBearerAuth('access-token')
  @Post('create')
  @UseGuards(AuthGuard)
  async createApplication(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateApplicationDto,
  ) {
    const application = this.applicationService.createApplication(
      user.id,
      body,
    );
    return new SuccessResponseDto({
      data: application,
      message: 'Successfully created the application',
    });
  }

  @ApiBearerAuth('access-token')
  @Get('details/:applicationId')
  @UseGuards(AuthGuard, ApplicationOwnershipGuard)
  async getApplicationDetails(@Param('applicationId') applicationId: string) {
    const application =
      await this.applicationService.getApplication(applicationId);
    return new SuccessResponseDto({
      data: application,
      message: 'Successfully retrieved the application details',
    });
  }

  @ApiBearerAuth('access-token')
  @Get('paginate')
  @UseGuards(AuthGuard)
  async paginateApplications(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationDto,
  ) {
    const {
      applications,
      total,
      page = 1,
      limit = 5,
    } = await this.applicationService.paginateApplications(user.id, query);

    const nextPage = page * limit < total ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    return new SuccessResponseDto({
      data: applications,
      meta: {
        total,
        page,
        limit,
        nextPage,
        prevPage,
      },
      message: 'Successfully paginated applications',
    });
  }

  @ApiBearerAuth('access-token')
  @Patch('update/:applicationId')
  @UseGuards(AuthGuard, ApplicationOwnershipGuard)
  async updateApplication(
    @Param('applicationId') applicationId: string,
    @Body() body: UpdateApplicationDto,
  ) {
    const application = this.applicationService.updateApplication(
      applicationId,
      body,
    );
    return new SuccessResponseDto({
      data: application,
      message: 'Successfully updated the application',
    });
  }

  @ApiBearerAuth('access-token')
  @Delete('remove/:applicationId')
  @UseGuards(AuthGuard, ApplicationOwnershipGuard)
  async removeApplication(@Param('applicationId') applicationId: string) {
    const application =
      this.applicationService.removeApplication(applicationId);
    return new SuccessResponseDto({
      data: application,
      message: 'Successfully removed the application',
    });
  }
}
