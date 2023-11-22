/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnModuleInit {

  @WebSocketServer()
  public server: Server;

  constructor(private readonly chatService: ChatService) {}

  onModuleInit() {
      // escuchar conecciones nuevas
      this.server.on('connection', (socket: Socket) => {
        console.log(socket)
        const {name, token} = socket.handshake.auth;

        if (!name) {
          socket.disconnect();
          return;
        }

        this.chatService.onClientConnected({id: socket.id, name: name})

        //para emitir a todos los clientes
        this.server.emit('on-clients-change', this.chatService.getClients())

        //para saludar a un cliente
        socket.emit('welcome-message', 'Bienvenido al servidor');

        console.log('Cliente conectado: ', socket.id)

        socket.on('disconnect', () => {
          console.log('Cliente desconectado: ', socket.id)
          this.chatService.onClientDisconnected(socket.id);
          this.server.emit('on-clients-change', this.chatService.getClients())
        })
      })

  }


  @SubscribeMessage('send-message')
  handleMessage(@MessageBody() message: string, @ConnectedSocket() client: Socket) {
    const {name, token} = client.handshake.auth;
    console.log(name, message)

    if (!message) {
      return
    }

    this.server.emit('on-message', {
      userId: client.id,
      message,
      name
    })
  }





}
