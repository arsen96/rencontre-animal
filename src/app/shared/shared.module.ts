import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { JungleBackgroundComponent } from './components/jungle-background/jungle-background.component';
import { PrimaryButtonComponent } from './components/primary-button/primary-button.component';
import { StepHeaderComponent } from './components/step-header/step-header.component';
import { AnimalFlipCardComponent } from './components/animal-flip-card/animal-flip-card.component';
import { SwipeCardComponent } from './components/swipe-card/swipe-card.component';
import { ProfileDetailModalComponent } from './components/profile-detail-modal/profile-detail-modal.component';
import { ChatBubbleComponent } from './components/chat-bubble/chat-bubble.component';
import { AnimalAvatarComponent } from './components/animal-avatar/animal-avatar.component';
import { CityAutocompleteComponent } from './components/city-autocomplete/city-autocomplete.component';

@NgModule({
  declarations: [
    JungleBackgroundComponent,
    PrimaryButtonComponent,
    StepHeaderComponent,
    AnimalFlipCardComponent,
    AnimalAvatarComponent,
    SwipeCardComponent,
    ProfileDetailModalComponent,
    ChatBubbleComponent,
    CityAutocompleteComponent,
  ],
  imports: [CommonModule, IonicModule, TranslatePipe, TranslateDirective],
  exports: [
    JungleBackgroundComponent,
    PrimaryButtonComponent,
    StepHeaderComponent,
    AnimalFlipCardComponent,
    AnimalAvatarComponent,
    SwipeCardComponent,
    ProfileDetailModalComponent,
    ChatBubbleComponent,
    CityAutocompleteComponent,
    CommonModule,
    IonicModule,
    TranslatePipe,
    TranslateDirective,
  ],
})
export class SharedModule {}
