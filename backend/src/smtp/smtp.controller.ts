import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/types/express';
import { SmtpService } from './smtp.service';
import { SmtpDto } from './dto/smtp-dto';
import { SmtpConfigOwnershipGuard } from './guards/smtp-config-ownership/smtp-config-ownership.guard';

@Controller('smtp')
export class SmtpController {
  constructor(private readonly smtpService: SmtpService) {}

  @Get('all')
  @UseGuards(AuthGuard)
  async getAllSmtpConfigs(@CurrentUser() user: JwtPayload) {
    const smtpConfigs = await this.smtpService.getSmtpConfigurations(user.id);
    return {
      data: smtpConfigs,
      message: 'Successfully retrieved all SMTP configurations',
    };
  }

  @Patch('update/:smtpId')
  @UseGuards(AuthGuard, SmtpConfigOwnershipGuard)
  async updateSmtpConfig(
    @CurrentUser() user: JwtPayload,
    @Body() body: SmtpDto,
    @Body('smtpId') smtpId: string,
  ) {
    const updatedSmtpConfig = await this.smtpService.updateSmtpConfiguration(
      smtpId,
      body,
    );
    return {
      data: updatedSmtpConfig,
      message: 'Successfully updated the SMTP configuration',
    };
  }

  @Delete('delete/:smtpId')
  @UseGuards(AuthGuard, SmtpConfigOwnershipGuard)
  async deleteSmtpConfig(
    @CurrentUser() user: JwtPayload,
    @Body('smtpId') smtpId: string,
  ) {
    await this.smtpService.deleteSmtpConfiguration(smtpId);
    return {
      message: 'Successfully deleted the SMTP configuration',
    };
  }

  @Post('add')
  @UseGuards(AuthGuard)
  async createSmtpConfig(
    @Body() body: SmtpDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const smtpConfig = await this.smtpService.addSmtpConfiguration(
      user.id,
      body,
    );
    return {
      data: smtpConfig,
      message: 'Successfully added the SMTP configuration',
    };
  }
}
