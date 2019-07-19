/**
 * Represents a user of the application.
 */
export interface User {
  /**
   * UUID of the user.
   *
   * NOTE: This ID is generated when the user connects to the server.
   */
  id: string;

  /**
   * Full name of the user.
   *
   * NOTE: This value is sent when the user connects to the server.
   */
  name: string;
}
