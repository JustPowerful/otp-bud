import { Injectable } from '@nestjs/common';
import { SmtpDto } from './dto/smtp-dto';
import { prisma } from 'src/lib/prisma';

@Injectable()
export class SmtpService {
  async userOwnsSmtpConfig(smtpConfigId: string, userId: string) {
    const smtpConfig = await prisma.email.findUnique({
      where: {
        id: smtpConfigId,
        userId,
      },
    });
    return !!smtpConfig;
  }

  async addSmtpConfiguration(
    userId: string,
    { smtpService, smtpPassword, smtpPort, smtpUser }: SmtpDto,
  ) {
    const smtpConfig = await prisma.email.create({
      data: {
        smtpUser,
        smtpPort: parseInt(smtpPort, 10),
        smtpPassword,
        smtpService,
        userId,
      },
    });
    return smtpConfig;
  }

  async updateSmtpConfiguration(
    id: string,
    { smtpService, smtpPassword, smtpPort, smtpUser }: SmtpDto,
  ) {
    const smtpConfig = await prisma.email.update({
      where: {
        id,
      },
      data: {
        smtpUser,
        smtpPort: parseInt(smtpPort, 10),
        smtpPassword,
        smtpService,
      },
    });
    return smtpConfig;
  }

  async getSmtpConfigurations(userId: string) {
    const smtpConfigs = await prisma.email.findMany({
      where: {
        userId: userId,
      },
    });
    return smtpConfigs;
  }

  async deleteSmtpConfiguration(id: string) {
    try {
      // Delete the SMTP configuration with the specified ID from the database. If the deletion is successful, the function will return the deleted configuration data. If an error occurs during the deletion process, it will be caught and handled silently.
      const smtpConfig = await prisma.email.delete({
        where: {
          id,
        },
      });

      return smtpConfig;
    } catch (error) {
      // check if the error is because of foreign key constraint violation
      // meaning that if the smtp configuration is being used in any other table we should not delete it and return a message to the user
      if (error.code === 'P2003') {
        throw new Error(
          'Cannot delete this SMTP configuration because it is being used in another table.',
        );
      }

      throw new Error(
        'An error occurred while deleting the SMTP configuration.',
      );
    }
  }
}
