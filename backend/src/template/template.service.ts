import { Injectable } from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { prisma } from 'src/lib/prisma';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Prisma } from 'generated/prisma/browser';

@Injectable()
export class TemplateService {
  /**
   * Validates whether a user owns a specific template by checking the template ID and user ID against the database. This function queries the database to confirm that the template with the given ID is associated with an application owned by the user with the specified ID, returning true if ownership is confirmed and false otherwise.
   * @param templateId The ID of the template to check ownership for
   * @param userId The ID of the user to check ownership against
   * @returns A boolean indicating whether the user owns the template (true) or not (false)
   */
  async userOwnsTemplate(templateId: string, userId: string) {
    const template = await prisma.template.findUnique({
      where: {
        id: templateId,
        application: {
          ownerId: userId,
        },
      },
    });
    return !!template;
  }

  /**
   * Sets the active template for a specific application by updating the template's isActive flag to true.
   * @param applicationId The ID of the application for which to set the active template
   * @param templateId The ID of the template to set as active
   * @returns The updated template data
   */
  async setActiveTemplate(applicationId: string, templateId: string) {
    // First, deactivate all templates for the application
    await prisma.template.updateMany({
      where: {
        applicationId,
      },
      data: {
        isActive: false,
      },
    });

    // Then, activate the specified template
    const template = await prisma.template.update({
      where: {
        id: templateId,
      },
      data: {
        isActive: true,
      },
    });
    return template;
  }

  /**
   * Create a new template associated with a specific application by providing the application ID and template details. This function takes the application ID and a CreateTemplateDto object containing the name, subject, and body of the template, creates a new template in the database linked to the specified application, and returns the created template data.
   * @param applicationId The ID of the application to associate the new template with
   * @param createTemplate_Object An object containing the name, subject, and body of the template to be created
   * @returns The data of the template that was created in the database, including its ID, name, subject, body, and associated application ID
   */
  async createTemplate(
    applicationId: string,
    { name, subject, body }: CreateTemplateDto,
  ) {
    // Check if other active templates exist for the application
    const activeTemplate = await prisma.template.findFirst({
      where: {
        applicationId,
        isActive: true,
      },
    });

    const isActive = !activeTemplate; // Set the new template as active if no other active templates exist

    const template = await prisma.template.create({
      data: {
        name,
        subject,
        body,
        applicationId,
        isActive,
      },
    });
    return template;
  }

  /**
   * Gets the template data associated with a specific template ID from the database. This function queries the database for a template that matches the provided template ID and returns the corresponding template data if found, or null if no template exists with that ID.
   * @param templateId The template ID to retrieve from the database
   * @returns The template data associated with the provided template ID, or null if no template is found with that ID
   */
  async getTemplate(templateId: string) {
    const template = await prisma.template.findUnique({
      where: {
        id: templateId,
      },
    });
    return template;
  }

  /**
   * Remove the template associated with a specific template ID from the database. This function deletes the template that matches the provided template ID and returns the data of the deleted template, including its ID, name, subject, body, and associated application ID.
   * @param templateId The template ID to remove from the database
   * @returns The data of the template that was removed from the database, including its ID, name, subject, body, and associated application ID
   */
  async removeTemplate(templateId: string) {
    const template = await prisma.template.delete({
      where: {
        id: templateId,
      },
    });
    return template;
  }

  /**
   *  Updates the template associated with a specific template ID in the database. This function takes the template ID and an UpdateTemplateDto object containing the updated name, subject, and body of the template, updates the corresponding template in the database with the new values, and returns the updated template data, including its ID, name, subject, body, and associated application ID.
   * @param templateId The ID of the template to update in the database
   * @param updateTemplate_Object An object containing the updated name, subject, and body of the template
   * @returns The data of the template that was updated in the database, including its ID, name, subject, body, and associated application ID
   */
  async updateTemplate(
    templateId: string,
    { name, subject, body }: UpdateTemplateDto,
  ) {
    const template = await prisma.template.update({
      where: {
        id: templateId,
      },
      data: {
        name,
        subject,
        body,
      },
    });
    return template;
  }

  /**
   * Paginates the templates associated with a specific application ID from the database based on the provided pagination parameters. This function takes the application ID and a PaginationDto object containing the page number, limit of items per page, and an optional search query, retrieves the corresponding templates from the database that match the criteria, and returns an object containing the paginated template data along with metadata about the pagination, including total items, current page, limit per page, total pages, and next/previous page numbers.
   * @param applicationId  The ID of the application to paginate templates for
   * @param paginationDto An object containing pagination parameters such as page number, limit of items per page, and an optional search query to filter templates by name or subject
   * @returns An object containing the paginated template data along with metadata about the pagination, including total items, current page, limit per page, total pages, and next/previous page numbers
   */
  async paginateTemplates(
    applicationId: string,
    { page = 1, limit = 5, query, skip }: PaginationDto,
  ) {
    const whereClause: Prisma.TemplateWhereInput = {
      applicationId,
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { subject: { contains: query, mode: 'insensitive' } },
        ],
      }),
    };

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where: whereClause,
        skip,
        take: limit,
      }),
      prisma.template.count({ where: whereClause }),
    ]);

    return {
      data: templates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
