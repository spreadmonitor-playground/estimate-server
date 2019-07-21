import { Socket } from 'socket.io';
import { Estimation } from '../interfaces';
import { defaultGroupStore, defaultConnectionStore } from '../stores';
import { Group } from '../group.class';

const logger = require('debug')('EstimatorApp:EstimationHandler');

export class EstimationHandler {
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
    const channelName = 'getEstimations';
    logger(`Sending estimations ${group.id}:${channelName} room.`);

    if (group !== null) {
      socket.emit(channelName, group.estimations);
      socket.to(group.id).emit(channelName, group.estimations);

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
