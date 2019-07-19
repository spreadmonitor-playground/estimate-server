import { Estimation, User, EstimationGroup } from './interfaces';
import { uuid } from './utils';

export class Group implements EstimationGroup {
  public readonly id: string = 'GROUP-' + uuid();
  public readonly members: User[] = [];
  public readonly estimations: Estimation[] = [];

  /**
   * Adds the user to the group if the user is not a member of the group.
   */
  public addMember(newUser: User): void {
    if (!this.isMember(newUser)) {
      this.members.push(newUser);
    }
  }

  /**
   * Removes the user and his/her estimations from the group if the user is a member of the group.
   */
  public removeMember(userId: string): void {
    const userIndexInGroup: number = this.members.findIndex(existingUser => existingUser.id === userId);
    const estimationIndex: number = this.estimations.findIndex(estimation => estimation.userId === userId);

    if (userIndexInGroup !== -1) {
      this.members.splice(userIndexInGroup, 1);
    }

    if (estimationIndex !== -1) {
      this.estimations.splice(estimationIndex, 1);
    }
  }

  /**
   * Returns true if the user is part of this group.
   */
  public isMember(user: User): boolean {
    return this.members.some(existingUser => existingUser.id === user.id);
  }

  /**
   * Adds or overwrites the estimation if the user is part of this group.
   */
  public addEstimation(estimation: Estimation): void {
    const estimationIndex = this.estimations.findIndex(e => estimation.userId === e.userId);

    /** We return if the user is not part of this group. */
    if (!this.isMember({ id: estimation.userId, name: '' })) {
      return;
    }

    if (estimationIndex == -1) {
      /** If the estimation doesn't exist yet we add it as new */
      this.estimations.push(estimation);
    } else {
      /** If the estimation already exists we overwrite in in-place. */
      this.estimations[estimationIndex] = estimation;
    }
  }

  /**
   * Removes all estimation from the group.
   */
  public resetEstimations(): void {
    this.estimations.splice(0, this.estimations.length);
  }

  /**
   * Returns the group value as a plain Object.
   */
  public toObject(): EstimationGroup {
    return {
      id: this.id,
      members: this.members,
      estimations: this.estimations,
    };
  }
}
