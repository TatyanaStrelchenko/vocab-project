import { connect } from 'socket.io-client';
import { getJwt } from './auth-service';

const socketOptions = { query: `token=${getJwt()}` };

export const socket = connect(socketOptions);
