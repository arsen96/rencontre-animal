import { NgModule } from '@angular/core';
import { ChatsPageRoutingModule } from './chats-routing.module';
import { ChatsPage } from './chats.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, ChatsPageRoutingModule],
  declarations: [ChatsPage],
})
export class ChatsPageModule {}
