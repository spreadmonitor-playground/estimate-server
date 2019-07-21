import { Socket } from 'socket.io';

import { defaultGroupStore } from './group-store.class';
import { User } from '../interfaces';
import { uuid } from '../utils';

const logger = require('debug')('EstimatorApp:ConnectionStore');

/**
 * Stores all active connections to the server.
 */
export class ConnectionStore {
  private readonly connections: { [connectionId: string]: { socket: Socket; user: User } } = {};

  public setProfile(socket: Socket, user: User): void {
    if (this.connections[socket.id]) {
      /** We save and re-set the connection ID because it's generated by the server. */
      const currentId = this.connections[socket.id].user.id;

      logger(
        `Updating user profile from "${this.connections[socket.id].user.name}" to "${user.name}". (User#${currentId}).`
      );

      this.connections[socket.id].user = { id: currentId, name: user.name };

      socket.emit('getSelf', this.connections[socket.id].user);
    }
  }

  public addConnection(socket: Socket): void {
    const id = uuid();
    this.connections[socket.id] = { socket, user: { id, name: 'Anonymous' } };

    logger(`New connection to the server (User#${id}).`);
    logger(`Currently ${Object.keys(this.connections).length} user is connected.`);

    socket.emit('getSelf', this.connections[socket.id].user);
  }

  public removeConnection(socket: Socket): void {
    /** Remove the user from all groups */
    defaultGroupStore.leaveGroups(socket);

    logger(`Connection closed. (User#${this.connections[socket.id].user.id}).`);

    delete this.connections[socket.id];

    logger(`Currently ${Object.keys(this.connections).length} user is connected.`);
  }

  /**
   * Returns the User belonging to the connection or null
   * when the give passed connection doesn't exist.
   */
  public getUserForSocket(socket: Socket): User {
    if (this.connections[socket.id] === undefined) {
      throw new Error('[ConnectionStore#getUser] Cannot get user for not existing connection!');
    }

    return this.connections[socket.id].user;
  }
}

export const defaultConnectionStore = new ConnectionStore();
