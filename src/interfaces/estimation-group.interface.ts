import { User } from './user.interface';
import { Estimation } from './estimation.interface';

/**
 * Represents a currently open estimation group created by a user.
 */
export interface EstimationGroup {
  /**
   * UUID of the group.
   */
  id: string;

  /**
   * List of members in this group.
   */
  members: User[];

  /**
   * List of current estimations in the group.
   *
   * NOTE: This value is cleared when all member voted to prepare for
   * the next vote. The app handles this via not listening/reacting to changes
   * in the vote result screen.
   */
  estimations: Estimation[];
}
