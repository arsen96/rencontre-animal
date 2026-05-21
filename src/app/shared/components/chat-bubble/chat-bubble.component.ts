import { Component, Input } from '@angular/core';
import { ChatMessage } from '../../../core/interfaces/message.interface';

@Component({
  selector: 'app-chat-bubble',
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.scss'],
  standalone: false,
})
export class ChatBubbleComponent {
  @Input() message!: ChatMessage;
  @Input() isMine = false;
}
