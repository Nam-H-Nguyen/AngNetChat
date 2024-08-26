import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

// ChatService handles real-time communication with SignalR
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // init connection
  public connection: signalR.HubConnection = new signalR.HubConnectionBuilder()
    .withUrl('https://localhost:5000/chat')
    .configureLogging(signalR.LogLevel.Information)
    .build();

  public messages$ = new BehaviorSubject<any>([]);
  public connectedUsers$ = new BehaviorSubject<string[]>([]);
  public messages: any[] = [];
  public users: string[] = [];

  constructor() {
    this.start();
    this.connection.on(
      'ReceiveMessage',
      (user: string, message: string, messageDateTime: string) => {
        console.log("User : " + user + " Message : " + message + " Date : " + messageDateTime);
        // this.messages = [...this.messages, { user, message, messageDateTime }];
        // this.messages$.next(this.messages);
      }
    );

    this.connection.on('ConnectedUser', (users: any) => {
      console.log("Connected Users: " + users);
      // this.connectedUsers$.next(users);
    });
  }

  // start connection
  public async start() {
    try {
      await this.connection.start();
      console.log('Connection is established!');
    } catch (error) {
      console.log(error);
    }
  }

  // request SignalR hub invoking JoinRoom() from backend
  public async joinRoom(user: string, room: string) {
    return this.connection.invoke('JoinRoom', { user, room });
  }

  // request SignalR hub invoking SendMessage() from backend
  public async sendMessage(message: string) {
    return this.connection.invoke('SendMessage', message);
  }

  public async leaveChat() {
    return this.connection.stop();
  }
}
