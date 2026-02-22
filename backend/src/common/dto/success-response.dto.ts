/**
 * A generic DTO for successful API responses.
 * It includes a success flag, an optional message, the data payload, and optional metadata.
 */
export class SuccessResponseDto<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: any;

  constructor(partial: Partial<SuccessResponseDto<T>>) {
    Object.assign(this, partial);
    this.success = true; // Always set success to true for this DTO
  }
}
