import { Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { prisma } from 'src/lib/prisma';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class ApplicationService {
  /**
   * Validates whether a user is the owner of a specific application by checking the application ID and user ID against the database. This function queries the database to confirm that the application with the given ID is owned by the user with the specified ID, returning true if ownership is confirmed and false otherwise.
   * @param applicationId The ID of the application to check ownership for
   * @param userId The ID of the user to check ownership against
   * @returns
   */
  async validateOwnership(applicationId: string, userId: string) {
    const exists = await prisma.application.findFirst({
      where: {
        id: applicationId,
        ownerId: userId,
      },
    });
    return !!exists;
  }

  /**
   * Gets the application data associated with a specific application ID from the database. This function queries the database for an application that matches the provided application ID and returns the corresponding application data if found, or null if no application exists with that ID.
   * @param applicationId The application ID to retrieve from the database
   * @returns The application data associated with the provided application ID, or null if no application is found with that ID
   */
  async getApplication(applicationId: string) {
    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
    });
    return application;
  }

  /**
   * Creates a new application with the specified name, description, and picture, and associates it with the given owner ID.
   * @param ownerId ID of the user who will own the application
   * @param createApplication_Object Object containing the name, description, and picture of the application to be created
   * @returns The application data that was created in the database
   */
  async createApplication(
    ownerId: string,
    { name, description, picture }: CreateApplicationDto,
  ) {
    return await prisma.application.create({
      data: {
        name,
        description,
        picture,
        ownerId: ownerId,
      },
    });
  }

  /**
   * Retrieves a paginated list of applications owned by a specific user, with optional search functionality to filter applications by name or description. The pagination parameters include the page number, limit of items per page, and an optional search query.
   * @param ownerId ID of the user whose applications are being paginated
   * @param paginationDto Object containing pagination parameters such as page number, limit, and optional search query for filtering applications by name or description
   * @returns A paginated list of applications owned by the specified user, along with the total count of applications that match the search criteria (if provided)
   */
  async paginateApplications(ownerId: string, paginationDto: PaginationDto) {
    const { page, limit, query, skip } = paginationDto;
    const where: Prisma.ApplicationWhereInput = {
      ownerId,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const applications = await prisma.application.findMany({
      where,
      skip,
      take: limit,
    });
    const total = await prisma.application.count({ where });
    return {
      applications,
      total,
      page,
      limit,
    };
  }

  /**
   * Update an existing application in the database based on the provided application ID and update data. This will modify the application's name, description, and/or picture as specified in the updateApplicationDto.
   * @param applicationId ID of the application to be updated
   * @param updateApplicationDto Object containing the updated name, description, and/or picture of the application
   * @returns The updated application data that was modified in the database
   */
  async updateApplication(
    applicationId: string,
    updateApplicationDto: UpdateApplicationDto,
  ) {
    return await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: updateApplicationDto,
    });
  }

  /**
   * Removes an application from the database based on the provided application ID. This will delete the application and all associated data.
   * @param applicationId ID of the application to be removed
   * @returns The data of the application that was deleted from the database
   */
  async removeApplication(applicationId: string) {
    return await prisma.application.delete({
      where: {
        id: applicationId,
      },
    });
  }
}
