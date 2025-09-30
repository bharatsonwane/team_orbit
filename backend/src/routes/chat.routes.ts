import RouteRegistrar from '../middleware/RouteRegistrar';
import { authRoleMiddleware } from '../middleware/authRoleMiddleware';
import {
  getMessagesByChatChannel,
  sendMessage,
} from '../controllers/chat.controller';

const registrar = new RouteRegistrar({
  basePath: '/api/chat',
  tags: ['Chat'],
});

registrar.get('/chat/:senderId/:receiverId', {
  controller: getMessagesByChatChannel,
});
/**@description send chat */
registrar.post('/send', {
  controller: sendMessage,
});

export default registrar;
