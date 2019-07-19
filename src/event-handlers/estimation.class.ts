import { Socket } from 'socket.io';
import { Estimation } from '../interfaces';
import { defaultGroupStore, defaultConnectionStore } from '../stores';
import { Group } from '../group.class';

const logger = require('debug')('EstimatorApp:EstimationHandler');

export class EstimationHandler {
  public startEstimation(socket: Socket, payload: { groupId: string }): void {
    logger(`Starting estimation in Group#${payload.groupId}.`);
    const group = defaultGroupStore.getGroupForSocket(socket);

    if (group === null) {
      // prettier-ignore
      throw new Error(`[EstimationHandler#startEstimation] Cannot start estimation because Group#${payload.groupId} doesn't exists!`);
    }

    /** Reset any existing estimation in the start. */
    logger(`Resetting estimations in Group#${payload.groupId}.`);
    group.resetEstimations();

    this.sendEstimations(socket, group);
  }

  public handleNewEstimation(socket: Socket, estimation: Estimation): void {
    const user = defaultConnectionStore.getUserForSocket(socket);
    const group = defaultGroupStore.getGroupForSocket(socket);

    if (!group) {
      logger(`Could not find group for the User#${user.id} (${user.name})!`);
      return;
    }

    logger(`User#${user.id} (${user.name}) sent estimation in Group#${group.id}.`);

    group.addEstimation(estimation);

    this.sendEstimations(socket, group);
  }

  /**
   * Sends the estimations to all members in the specified group.
   */
  private sendEstimations(socket: Socket, group: Group): void {
    logger(`Sending estimations ${group.id}:estimation room.`);

    if (group !== null) {
      socket.emit('estimations', group.estimations);
      socket.to(group.id).emit(`estimations`, group.estimations);

      if (group.estimations.length === group.members.length) {
        logger(`All user has sent an estimation in Group#${group.id}.`);
        /**
         * Reset estimations after they have benne sent when every member has voted.
         * This is needed fo prevent the app jumping between the summary and vote screen,
         * because as soon as a user vote again the number of votes would be the same as
         * the number of users.
         */
        logger(`Resetting estimations in Group#${group.id}.`);
        group.resetEstimations();
      }
    }
  }
}

export const defaultEstimationHandler = new EstimationHandler();
