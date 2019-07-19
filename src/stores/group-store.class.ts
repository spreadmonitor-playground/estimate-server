import { Socket } from 'socket.io';
import { Group } from '../group.class';
import { defaultConnectionStore } from './connection-store.class';

const logger = require('debug')('EstimatorApp:GroupStore');

/**
 * Stores all active groups and enable various interactions with them.
 */
export class GroupStore {
  /**
   * Currently existing groups.
   */
  private readonly groups: { [groupsId: string]: Group } = {};

  /**
   * Sends the group to the given socket and the default "lobby" room.
   */
  public sendGroups(socket: Socket): void {
    const currentGroups = Object.values(this.groups).map(group => group.toObject());

    logger(`Sending groups (${Object.values(this.groups).length}) to Socket#${socket.id} and to "lobby" room...`);

    socket.emit('getGroups', currentGroups);
    socket.to('lobby').broadcast.emit('getGroups', currentGroups);
  }

  /**
   * Returns a Group with the specified ID or null otherwise.
   */
  public getGroupForSocket(socket: Socket): Group | null {
    const user = defaultConnectionStore.getUserForSocket(socket);

    const group = Object.values(this.groups).find(group => group.isMember(user));

    if (!group) {
      logger(`User#${user.id} (${user.name}) is not part of any group!`);
      return null;
    }

    return group;
  }

  /**
   * Creates a new group and enters it immediately.
   */
  public createGroup(socket: Socket): Group {
    const group = new Group();
    const user = defaultConnectionStore.getUserForSocket(socket);

    if (user === null) {
      throw new Error('[GroupStore#createGroup] Cannot create group, because no User found for this connection!');
    }

    logger(`Creating new group for User#${user.id} (${user.name}).`);

    this.groups[group.id] = group;

    /** We enter the newly created group immediately. */
    this.enterGroup(socket, { groupId: group.id });

    return group;
  }

  public enterGroup(socket: Socket, payload: { groupId: string }): void {
    const user = defaultConnectionStore.getUserForSocket(socket);
    const targetGroup = this.groups[payload.groupId];

    if (user === null) {
      throw new Error(`[GroupStore#enterGroup] Cannot enter group, because no User found for this connection!`);
    }

    if (!targetGroup) {
      throw new Error(`[GroupStore#enterGroup] Cannot enter group, because target group doesn't exists!`);
    }

    /** Leave current groups */
    this.leaveGroups(socket, [targetGroup.id]);

    logger(`User#${user.id} (${user.name}) is entering Group#${payload.groupId}.`);

    targetGroup.addMember(user);

    /** Join the channel of the group */
    socket.join(targetGroup.id);

    /** Broadcast the new state to the clients */
    this.sendGroups(socket);
  }

  /**
   * Removes the user from all groups.
   */
  public leaveGroups(socket: Socket, exceptions: string[] = []): void {
    const user = defaultConnectionStore.getUserForSocket(socket);

    if (user === null) {
      throw new Error(`[GroupStore#enterGroup] Cannot leave groups, because no User found for this connection!`);
    }

    logger(`User#${user.id} (${user.name}) is leaving all groups.`);

    /** Remove user from all group. */
    Object.values(this.groups).forEach(group => group.removeMember(user.id));

    /** Leave all socket channels. */
    Object.values(socket.rooms)
      .filter(roomName => roomName.match(/^GROUP-/))
      .map(groupId => socket.leave(groupId));

    /** Cleanup groups which has no member anymore. */
    logger(`Cleaning up empty groups.`);
    Object.values(this.groups)
      .filter(group => group.members.length === 0)
      .filter(group => !exceptions.includes(group.id))
      .forEach(group => delete this.groups[group.id]);

    /** Broadcast the changes to every user. */
    this.sendGroups(socket);
  }
}

export const defaultGroupStore = new GroupStore();
