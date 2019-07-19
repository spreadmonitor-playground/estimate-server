import * as socketIo from 'socket.io';
import { defaultGroupStore, defaultConnectionStore } from './stores';
import { defaultEstimationHandler } from './event-handlers/estimation.class';

const logger = require('debug')('EstimatorApp:main');

function main(): void {
  logger(`Starting server on ${process.env['PORT'] || 3000}...`);
  const server = socketIo.listen(process.env['PORT'] || 3000, { origins: '*:*' });

  server.sockets.on('connection', socket => {
    /** We save the connection so later we can set and get the user belonging to this connection. */
    defaultConnectionStore.addConnection(socket);

    /** Join the common lobby we dispatch messages in. */
    socket.join('lobby');

    /** Send the currently existing groups */
    defaultGroupStore.sendGroups(socket);

    /** We bind the various event handlers. */
    socket.on('setProfile', defaultConnectionStore.setProfile.bind(defaultGroupStore, socket));
    socket.on('createGroup', defaultGroupStore.createGroup.bind(defaultGroupStore, socket));
    socket.on('enterGroup', defaultGroupStore.enterGroup.bind(defaultGroupStore, socket));
    socket.on('leaveGroup', defaultGroupStore.leaveGroups.bind(defaultGroupStore, socket, []));
    socket.on('startEstimation', defaultEstimationHandler.startEstimation.bind(defaultEstimationHandler, socket));
    socket.on('sendEstimation', defaultEstimationHandler.handleNewEstimation.bind(defaultEstimationHandler, socket));

    /** Handle disconnection:  */
    socket.on('disconnect', () => {
      const user = defaultConnectionStore.getUserForSocket(socket);

      if (user) {
        defaultGroupStore.leaveGroups(socket);
      }

      defaultConnectionStore.removeConnection(socket);
    });
  });
}

main();
