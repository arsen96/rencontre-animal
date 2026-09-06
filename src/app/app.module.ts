import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  chatbubbleEllipsesOutline,
  chatbubbleOutline,
  chatbubblesOutline,
  checkmarkOutline,
  checkmark,
  chevronForwardOutline,
  close,
  closeCircleOutline,
  compassOutline,
  createOutline,
  gridOutline,
  heart,
  idCardOutline,
  imageOutline,
  informationCircleOutline,
  locationOutline,
  logoGoogle,
  logOutOutline,
  male,
  maleFemale,
  female,
  pauseOutline,
  personCircleOutline,
  playOutline,
  send,
  swapHorizontalOutline,
  trashOutline,
} from 'ionicons/icons';

import { Capacitor } from '@capacitor/core';
import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { provideFirestore, initializeFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth, initializeAuth, indexedDBLocalPersistence } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
import { provideTranslateService, TranslatePipe } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import { LanguageService } from './core/services/language.service';

addIcons({
  'logo-google': logoGoogle,
  'chatbubble-ellipses-outline': chatbubbleEllipsesOutline,
  'chatbubble-outline': chatbubbleOutline,
  'chatbubbles-outline': chatbubblesOutline,
  'information-circle-outline': informationCircleOutline,
  'location-outline': locationOutline,
  'arrow-back': arrowBack,
  'log-out-outline': logOutOutline,
  send,
  close,
  heart,
  'image-outline': imageOutline,
  'checkmark-outline': checkmarkOutline,
  checkmark,
  'close-circle-outline': closeCircleOutline,
  male,
  female,
  'male-female': maleFemale,
  'id-card-outline': idCardOutline,
  'grid-outline': gridOutline,
  'compass-outline': compassOutline,
  'person-circle-outline': personCircleOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'swap-horizontal-outline': swapHorizontalOutline,
  'create-outline': createOutline,
  'pause-outline': pauseOutline,
  'play-outline': playOutline,
  'trash-outline': trashOutline,
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
    TranslatePipe,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'fr',
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (language: LanguageService) => () => language.init(),
      deps: [LanguageService],
      multi: true,
    },
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() =>
      initializeFirestore(getApp(), {
        ignoreUndefinedProperties: true,
        experimentalForceLongPolling: true,
      })
    ),
    provideAuth(() => {
      if (Capacitor.isNativePlatform()) {
        return initializeAuth(getApp(), { persistence: indexedDBLocalPersistence });
      }
      return getAuth();
    }),
    provideStorage(() => getStorage()),
    provideHttpClient(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
