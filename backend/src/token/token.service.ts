import { Injectable } from '@nestjs/common';
import { prisma } from 'src/lib/prisma';
import { randomBytes } from 'crypto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class TokenService {
  /**
   * Get token data by token string. This function queries the database for a token record that matches the provided token string and returns the corresponding token data if found, or null if no matching token is found.
   * @param token The token string to search for in the database. This string is typically a unique identifier associated with a user's session or authentication credentials. The function will look up this token in the database to retrieve its associated data, such as the user ID, expiration time, and any other relevant information stored in the token record.
   * @returns The token data associated with the provided token string, or null if no matching token is found in the database. The returned token data may include information such as the user ID, expiration time, and any other relevant details stored in the token record.
   */
  async getToken(token: string) {
    return await prisma.token.findUnique({
      where: { token },
    });
  }

  /**
   * Paginate tokens for a specific user. This function retrieves a paginated list of tokens associated with a given user ID, allowing for optional filtering based on a search query. The pagination parameters include the page number, limit of items per page, and an optional search query to filter tokens by their token string. The function returns a list of tokens that match the specified criteria, along with pagination metadata such as total count and current page information.
   * @param userId The ID of the user whose tokens are being paginated. This parameter is used to filter the tokens in the database to only include those that belong to the specified user. The function will query the database for tokens that have a matching user ID and return a paginated list of those tokens based on the provided pagination parameters.
   * @param pagination_object An object containing pagination parameters, including the page number, limit of items per page, an optional search query to filter tokens by their token string, and an optional skip parameter to specify the number of items to skip before starting to collect the result set. The pagination parameters allow for efficient retrieval of tokens in a paginated manner, enabling clients to navigate through large sets of tokens without overwhelming the server or client with excessive data.
   * @returns
   */
  async paginateTokens(
    userId: string,
    { page = 1, limit = 5, query, skip }: PaginationDto,
  ) {
    const where: Prisma.TokenWhereInput = { userId };
    if (query) {
      where.token = {
        contains: query,
        mode: 'insensitive',
      };
    }
    const tokens = await prisma.token.findMany({
      where,
      skip,
      take: limit || 10,
    });

    const total = await prisma.token.count({ where });

    return {
      items: tokens,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * This function checks if a given token belongs to a specific user by querying the database for a matching token and user ID. It returns true if the token is found and belongs to the user, and false otherwise.
   * @param token the token string to check ownership of
   * @param userId user ID to check ownership against
   * @returns boolean indicating whether the user owns the token or not
   */
  async userOwnsToken(token: string, userId: string) {
    const data = await prisma.token.findUnique({
      where: { token, userId },
    });
    return !!data;
  }

  /**
   * This function creates a new token for a specific user. It generates a random token string and stores it in the database along with the user ID and an optional expiration time.
   * @param userId user ID to create token for
   * @param expiresIn optional expiration time in seconds
   * @returns the created token data
   */
  async createToken(userId: string, expiresIn?: number) {
    const generatedToken = randomBytes(32).toString('hex');
    const data = await prisma.token.create({
      data: {
        token: generatedToken,
        userId,
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
      },
    });
    return data;
  }

  /**
   * Revoke a token by deleting it from the database. This function takes a token string as input and removes the corresponding token record from the database, effectively revoking its validity.
   * @param token The token string to be revoked
   * @returns The data of the revoked token, or null if the token was not found in the database
   */
  async revokeToken(token: string) {
    const data = await prisma.token.delete({
      where: { token },
    });
    return data;
  }
}
