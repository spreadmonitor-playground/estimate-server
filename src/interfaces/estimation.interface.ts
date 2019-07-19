/**
 * Represents an estimation sent by a user.
 */
export interface Estimation {
  /**
   * UUID of the user who sent this estimation.
   */
  userId: string;

  /**
   * Selected complexity by the user.
   */
  complexity: number;

  /**
   * Selected effort by the user.
   */
  effort: number;
}
