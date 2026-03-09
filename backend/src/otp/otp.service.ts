import { Injectable } from '@nestjs/common';
import { prisma } from 'src/lib/prisma';

@Injectable()
export class OtpService {
  /**
   * Generates a 6-digit OTP, saves it to the database with the associated email and application, and returns the OTP record.
   * @param expiresAt - The expiration time for the OTP
   * @param email - The email address associated with the OTP
   * @param applicationId - The ID of the application for which the OTP is generated
   * @returns The created OTP record from the database
   */
  async generateOtp(expiresAt: Date, email: string, applicationId: string) {
    // Generate a random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Store it into the database with the associated email and application
    const otp = await prisma.otp.create({
      data: {
        otp: otpCode,
        email,
        application: {
          connect: { id: applicationId },
        },
        expiresAt,
      },
    });
    return otp;
  }

  /**
   * Verifies the provided OTP against the stored OTP for the given email and application. It checks if the OTP is valid and not expired.
   * @param email The email address associated with the OTP
   * @param otp The OTP code to verify
   * @param applicationId The ID of the application for which the OTP is generated
   */
  async verifyOtp(email: string, otp: string, applicationId: string) {
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email,
        otp,
        applicationId,
        expiresAt: {
          gt: new Date(), // Check if the OTP is not expired
        },
      },
    });
    return !!otpRecord; // Return true if OTP is found and not expired, false otherwise
  }

  /**
   * Deletes all OTP records for the given email and application ID.
   * @param email The email address associated with the OTP
   * @param applicationId The ID of the application for which the OTP is generated
   */
  async deleteOtp(email: string, applicationId: string) {
    await prisma.otp.deleteMany({
      where: {
        email,
        applicationId,
      },
    });
  }
}
