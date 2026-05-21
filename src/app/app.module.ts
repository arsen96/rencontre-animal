import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  chatbubbleEllipsesOutline,
  chatbubblesOutline,
  close,
  heart,
  informationCircleOutline,
  locationOutline,
  logoGoogle,
  send,
} from 'ionicons/icons';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

addIcons({
  'logo-google': logoGoogle,
  'chatbubble-ellipses-outline': chatbubbleEllipsesOutline,
  'chatbubbles-outline': chatbubblesOutline,
  'information-circle-outline': informationCircleOutline,
  'location-outline': locationOutline,
  'arrow-back': arrowBack,
  send,
  close,
  heart,
});

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot({
      mode: 'ios',
    }),
    AppRoutingModule,
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
