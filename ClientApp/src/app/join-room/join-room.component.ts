import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';


@Component({
  selector: 'app-join-room',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './join-room.component.html',
  styleUrl: './join-room.component.css'
})
export class JoinRoomComponent implements OnInit {
  joinRoomForm!: FormGroup;
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  chatService = inject(ChatService);

  ngOnInit(): void {
    this.joinRoomForm = this.formBuilder.group({
      user: ['', Validators.required],
      room: ['', Validators.required]
    });
  }

  joinRoom(){
    const { user, room } = this.joinRoomForm.value;
    this.chatService.joinRoom(user, room).then(() => {
      this.router.navigate(['chat']);
    }).catch((error) => {
      console.log(error)
    })
    this.router.navigate(['chat']);
  }
}
