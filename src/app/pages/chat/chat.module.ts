import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatPageRoutingModule } from './chat-routing.module';
import { ChatPage } from './chat.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, FormsModule, ChatPageRoutingModule],
  declarations: [ChatPage],
})
export class ChatPageModule {}
