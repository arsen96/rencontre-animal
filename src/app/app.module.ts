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
  logOutOutline,
  send,
} from 'ionicons/icons';

import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { provideFirestore, initializeFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';

addIcons({
  'logo-google': logoGoogle,
  'chatbubble-ellipses-outline': chatbubbleEllipsesOutline,
  'chatbubbles-outline': chatbubblesOutline,
  'information-circle-outline': informationCircleOutline,
  'location-outline': locationOutline,
  'arrow-back': arrowBack,
  'log-out-outline': logOutOutline,
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
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() =>
      initializeFirestore(getApp(), {
        ignoreUndefinedProperties: true,
        experimentalForceLongPolling: true,
      })
    ),
    provideAuth(() => getAuth()),
    provideHttpClient(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
