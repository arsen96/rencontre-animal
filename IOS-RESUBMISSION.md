# Animal Rencontre — préparation iOS 1.1 (5)

Audit du 25 octobre 2026. Aucun déploiement ni envoi de build effectué.

## État du projet

Le Bundle ID reste `com.animalrencontre.app`. Ne pas créer une nouvelle application dans App Store Connect : utiliser la fiche existante, version 1.1, avec le prochain build 5 (vérifier que ce numéro n'a pas été utilisé entre-temps).

Le dossier `ios` est absent. Il sera recréé sur Mac ; aucune compilation Swift, signature, archive ou connexion sur iPhone n'a été exécutée sous Windows. La disparition du projet local ne change pas l'identité de l'application chez Apple. La même équipe Apple Developer doit signer le nouveau projet.

### Versions réellement installées

| Élément | Version | Vérification |
| --- | --- | --- |
| Ionic Angular | 8.8.7 | Accepte Angular >=16 et RxJS >=7.5 |
| Angular / compilateur | 20.3.21 | TypeScript 5.9.3 et RxJS 7.8.2 compatibles |
| Angular CLI | 20.3.26 | Même branche Angular 20.3 |
| AngularFire | 20.0.1 | Angular 20, SDK Firebase interne 11.10.0 |
| Firebase à la racine | 12.14.0 | Requis par le plugin Authentication 8.3.0 (^12.6.0) |
| RxFire | 6.2.0 | Corrige le peer dependency Firebase 12 non accepté par 6.1.0 |
| Capacitor core / CLI / iOS | 8.3.4 | iOS ajouté et aligné sur core/CLI |
| Capacitor Android / App | 8.1.0 | Même majeure 8 ; conservés |
| Haptics / Keyboard / Push / Status bar | 8.0.2 / 8.0.3 / 8.0.2 / 8.0.2 | Même majeure 8 |
| Capacitor Firebase Authentication | 8.3.0 | Capacitor >=8 ; SDK iOS Firebase ~12.7.0 en CocoaPods |
| Node utilisé sous Windows | 24.13.1 | Compatible avec Angular 20.3 et Capacitor 8 |

Les deux versions JS de Firebase restent intentionnellement installées selon les contraintes des paquets. Tous les imports Firebase applicatifs passent par `@angular/fire/*` ; le plugin fournit les jetons natifs, ensuite convertis par AngularFire. Ne pas forcer Firebase 12 dans AngularFire 20 avec un override, ni mélanger des instances créées par des SDK différents. `npm ls firebase rxfire` doit terminer sans erreur. Le SDK Firebase iOS est une dépendance Swift distincte des SDK JavaScript.

## Modifications et raisons

- `package.json` et lockfile : ajout exact de `@capacitor/ios@8.3.4` et de `rxfire@6.2.0`. Aucun changement des dépendances Android existantes.
- `auth.service.ts` : refus d'une réponse Apple sans jeton ou sans nonce. Le plugin génère le nonce aléatoire, envoie son SHA-256 à Apple et renvoie le nonce brut pour Firebase. Une réponse incomplète produit une erreur au lieu d'être interprétée comme une annulation.
- `auth.service.ts` / `account.service.ts` : avant suppression, réauthentification puis révocation Apple. Sur iOS, le plugin transmet le code d'autorisation à `Auth.revokeToken(withAuthorizationCode:)`. Cette API requiert un utilisateur Firebase natif : pour cette opération seulement, `skipNativeAuth` passe à `false`, le code vérifie que le UID natif est celui du compte à supprimer, réauthentifie la session JS, révoque, puis ferme la session native dans `finally`. Les connexions ordinaires restent avec `skipNativeAuth: true`. Sur le Web, le SDK JS reçoit l'access token. Aucun jeton n'est persisté ou journalisé. Une annulation ou un échec de révocation arrête le parcours avant suppression des données.
- `ios-release.json` : version iOS `1.1`, build `5`, Bundle ID existant.
- `scripts/ios-version.mjs` : applique ces valeurs aux configurations Xcode Debug/Release après création du dossier `ios`. Refuse un Bundle ID inattendu et propose un mode `--check`. Ne lit ni ne modifie Android. Le `version` npm (`0.0.1`) n'est pas le numéro commercial iOS et reste inchangé.
- `scripts/ios/AppDelegate.swift` : modèle pour le nouveau projet, conservant les callbacks Capacitor pour Google/URL et ajoutant le pont APNs → FCM attendu par le serveur existant. À copier seulement dans le projet fraîchement généré, après ajout du pod Messaging.
- `.gitignore` : exclut le cache npm local utilisé pour cette préparation.

La page de connexion existante est conservée : bouton noir Apple, logo enregistré, traduction FR/EN, présent en connexion comme en inscription, condition `Capacitor.getPlatform() === 'ios'`. Il apparaît dans l'app iOS native, pas dans Safari ni sur Android. L'email masqué Apple est accepté : aucune exigence de fournir une autre adresse n'est ajoutée. Après authentification, le même parcours charge le profil ou ouvre le questionnaire. Le `uid` provient de Firebase, jamais de l'email. Aucun rattachement automatique à un compte Google n'est ajouté.

## Vérifications sous Windows

Depuis la racine du projet :

```powershell
npm.cmd ls --depth=0
npm.cmd ls firebase rxfire --depth=2
node --test scripts/ios-version.test.mjs
node --test scripts/apple-auth.test.cjs
npm.cmd run build -- --configuration production
```

La compilation de production inclut le remplacement par `environment.prod.ts` et écrit dans `www`, conformément à `capacitor.config.ts`. Les identifiants Firebase de production et `appId` sont conservés. Les avertissements Sass `@import` et les budgets de styles non bloquants préexistaient. Les tests du script vérifient Debug/Release, l'idempotence, le refus d'un identifiant inattendu ou d'un projet incomplet et la conservation du fichier Android.

Les sept tests Apple isolent le service avec des SDK simulés : nonce, transfert des jetons, choix de session native pour la révocation, refus d'un autre UID, arrêt sur erreur et nettoyage de session. Ils ne valident ni le SDK Swift réel, ni le réseau, ni les réglages Firebase/Apple, ni une connexion sur iPhone.

L'installation npm a également signalé 92 vulnérabilités dans l'ensemble des dépendances (développement inclus). Aucun `npm audit fix --force` n'a été exécuté ; leur analyse de sécurité dépasse cette correction iOS et n'est pas une validation de sécurité de l'application.

## MacinCloud : prérequis et transfert

Utiliser macOS avec **Xcode 26 ou ultérieur**, ses Command Line Tools, Node **24.x LTS**, npm et CocoaPods installé (`pod --version`). Capacitor 8 exige Node >=22 et Xcode >=26. Le minimum iOS du projet et des plugins est **15.0**. Choisir une machine MacinCloud capable de cette version de Xcode.

Transférer les sources et `package-lock.json` mis à jour, dont ce guide, `ios-release.json` et `scripts/ios/`. Ne pas transférer `node_modules`, `.angular`, `.npm-cache` ou `www` : ils seront régénérés. Les fichiers `service-account.json` et les clés sous `keys/` ne sont pas nécessaires à la compilation cliente.

Récupérer depuis **l'application iOS Firebase existante** le `GoogleService-Info.plist` pour `com.animalrencontre.app`, dans le même projet Firebase que l'application Web de production. Ne pas utiliser `google-services.json` Android et ne pas créer de nouveaux identifiants. Le plugin appelle `FirebaseApp.configure()` au chargement : l'absence du plist dans le bundle peut provoquer un crash au démarrage, même avec `skipNativeAuth: true`.

## MacinCloud : commandes de reconstruction

Ouvrir un terminal à la racine du projet transféré :

```bash
node --version
xcodebuild -version
xcode-select -p
pod --version
npm ci
npm ls firebase rxfire --depth=2
npm run build -- --configuration production
npx cap add ios --packagemanager CocoaPods
npm run ios:version
```

`cap add` s'exécute **une seule fois**, lorsque `ios` n'existe pas. Choix explicite de CocoaPods pour ce plugin 8.3.0 et pour intégrer Firebase Messaging sans SDK Facebook supplémentaire. Capacitor 8 choisirait SPM par défaut ; ne pas mélanger SPM et CocoaPods pour Firebase.

Après génération, dans `ios/App/Podfile`, sous `# Add your Pods here`, **en dehors** de `def capacitor_pods`, ajouter :

```ruby
  pod 'CapacitorFirebaseAuthentication/Google', :path => '../../node_modules/@capacitor-firebase/authentication'
  pod 'FirebaseMessaging', '~> 12.7.0'
```

Dans le bloc `post_install` **déjà présent**, conserver `assertDeploymentTarget(installer)` et ajouter la désactivation de signature des bundles de ressources :

```ruby
post_install do |installer|
  assertDeploymentTarget(installer)
  installer.pods_project.targets.each do |target|
    if target.respond_to?(:product_type) && target.product_type == 'com.apple.product-type.bundle'
      target.build_configurations.each do |config|
        config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
      end
    end
  end
end
```

Ne pas ajouter un deuxième bloc `post_install`. Ne pas modifier la section générée `def capacitor_pods` : une synchronisation la régénère.

Pour le projet **fraîchement créé**, copier le modèle qui restaure les notifications FCM :

```bash
cp scripts/ios/AppDelegate.swift ios/App/App/AppDelegate.swift
npx cap sync ios
npm run ios:version -- --check
npx cap open ios
```

Ces commandes ne signent, n'archivent et ne transmettent aucun build. `cap open` doit ouvrir **`ios/App/App.xcworkspace`** pour CocoaPods. Si la résolution des pods échoue parce que les spécifications locales sont anciennes :

```bash
cd ios/App
pod install --repo-update
cd ../..
```

Le modèle AppDelegate ajoute Firebase Messaging parce que `@capacitor/push-notifications` retourne normalement un jeton **APNs** sur iOS, alors que `functions/src/index.ts` envoie par **FCM** aux documents `users/{uid}/fcmTokens`. Il traduit le jeton et ses renouvellements vers l'événement Capacitor déjà utilisé par l'application. Cette intégration Swift reste à compiler et tester sur Mac.

## Xcode : identité, Firebase et signature

1. Ouvrir le projet `App`, sélectionner la **target App**. Dans General : Display Name `Animal Rencontre`, Version **1.1**, Build **5**, minimum deployment target **iOS 15.0** (aussi au niveau Project).
2. Dans Signing & Capabilities, choisir **la même Team Apple Developer** que l'application existante. Bundle Identifier : **`com.animalrencontre.app`** en Debug et Release. Activer Automatically manage signing si le compte le permet. Utiliser les certificats/profils existants ou laisser Xcode provisionner pour ce même App ID. Ne pas sélectionner Personal Team et ne pas inventer un Team ID.
3. Ajouter **Sign in with Apple** par `+ Capability`, pour toutes les configurations. Vérifier le fichier `.entitlements` généré avec `com.apple.developer.applesignin = [Default]` et sa référence dans `CODE_SIGN_ENTITLEMENTS`. L'activation sur le portail ne remplace pas cette étape locale. Rafraîchir les profils si la capacité n'y figure pas.
4. Ajouter **Push Notifications** ; vérifier l'entitlement APNs géré par la signature. Conserver les réglages Firebase APNs existants (Project settings → Cloud Messaging → application Apple). Ne pas recréer ou remplacer les clés si elles sont déjà configurées. Les notifications visibles utilisées ici ne nécessitent pas d'ajouter artificiellement un mode de push silencieux.
5. Ajouter `GoogleService-Info.plist` via **Add Files to App**, `Copy items if needed`, avec **Target Membership App**. Vérifier sa présence dans **Build Phases → Copy Bundle Resources** et ses valeurs `BUNDLE_ID` / `PROJECT_ID`. Le poser sur le disque sans l'ajouter à la target ne suffit pas.
6. Dans Target → Info → URL Types, ajouter le schéma correspondant exactement à **`REVERSED_CLIENT_ID`** du plist pour préserver Google Sign-In. Ne pas remplacer les callbacks `ApplicationDelegateProxy` présents dans l'AppDelegate fourni.
7. Vérifier la politique de confidentialité et les liens d'assistance utilisés par l'app ; la préparation n'a pas modifié `public/child-safety.html` ni publié les pages.
8. Restaurer les icônes depuis `assets/icon.png`, qui existe déjà. Sur Mac, après création du projet, exécuter uniquement la génération iOS :

```bash
npx capacitor-assets generate --ios --iconBackgroundColor '#2d4a2d'
```

Ne pas exécuter `npm run assets:icons` pour cette opération : ce script cible Android. Vérifier visuellement AppIcon, son format App Store 1024×1024 sans transparence, le launch screen, les orientations et les éventuels réglages spécifiques de l'ancien projet perdus. Sauvegarder ensuite le nouveau dossier `ios`, son Podfile, Podfile.lock et les ressources dans un dépôt privé ou une sauvegarde durable ; ne pas committer de certificats ni de clés privées.

Les API utilisées dans le code client ne montrent pas de plugin caméra ou géolocalisation natif nécessitant l'ajout de descriptions de permissions pour cette correction. Ne pas ajouter des permissions sans usage réel. Vérifier les manifests PrivacyInfo.xcprivacy des SDK dans l'archive et les déclarations App Privacy existantes dans App Store Connect.

## Contrôles locaux sur Mac, sans envoyer de build

Après les réglages Xcode :

```bash
npm run ios:version -- --check
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath .angular/ios-derived-data CODE_SIGNING_ALLOWED=NO build
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Release -showBuildSettings | grep -E 'PRODUCT_BUNDLE_IDENTIFIER|MARKETING_VERSION|CURRENT_PROJECT_VERSION|DEVELOPMENT_TEAM|CODE_SIGN_ENTITLEMENTS'
```

Le premier build compile Swift et les plugins sans tester la signature appareil. La sortie Release doit confirmer `com.animalrencontre.app`, `1.1`, `5`, la bonne équipe et le fichier d'entitlements. Le simulateur ne remplace pas la vérification de la connexion Apple sur iPhone.

Dans Xcode, choisir ensuite un iPhone de test enregistré, utiliser **Product → Build / Run**, puis vérifier :

- Apple et Google visibles ensemble dans l'app iOS, y compris en mode inscription ; aucune connexion Google imposée avant Apple.
- Première connexion Apple avec **Masquer mon adresse e-mail**, puis création du profil jusqu'à l'écran principal.
- Déconnexion, reconnexion Apple et restauration de la session après fermeture complète.
- Annulation de la fenêtre Apple sans blocage ; erreur réseau affichée et possibilité de réessayer.
- Connexion Google et email/mot de passe toujours utilisables ; gérer explicitement un éventuel conflit de compte sans fusionner les comptes par email.
- Suppression d'un compte Apple de test : réauthentification, révocation, suppression ; annulation avant toute suppression. Le code de suppression de données existant journalise certaines erreurs puis continue : contrôler dans Firebase la disparition effective des données de test, sans prétendre que ce mécanisme garantit un effacement complet en cas d'erreur réseau.
- Autorisation des notifications, enregistrement d'un jeton **FCM** et réception/ouverture d'un message de test de l'application ; vérifier aussi après changement de compte. Tester les réglages APNs production avant une future distribution.

Une archive signée et sa validation locale resteront ensuite à effectuer sur Mac, après ces tests. Dans Xcode, choisir une destination iOS générique puis **Product → Archive**, ou utiliser cette commande locale après configuration de la signature :

```bash
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Release -destination 'generic/platform=iOS' -archivePath .angular/archives/Animal-Rencontre-1.1-5.xcarchive archive
```

L'archive reste sur le Mac. Vérifier dans Organizer la version **1.1 (5)** et les entitlements signés. **Ne pas utiliser Distribute App / Upload ni envoyer le build dans le cadre de cette préparation.** La publication et la soumission restent une action ultérieure de l'utilisateur.

## Note de revue à adapter après tests réels

« La version 1.1 (5) propose désormais Continuer avec Apple sur l'écran de connexion et d'inscription iOS, aux côtés de Google. L'utilisateur peut masquer son adresse e-mail et accéder au même parcours de création de profil. Pour le vérifier, ouvrir l'application déconnectée puis choisir Continuer avec Apple. »

Ne pas annoncer aux reviewers que le parcours fonctionne sur appareil avant de l'avoir réellement testé. L'ajout du bouton seul ne garantit pas l'acceptation au titre de la règle 4.8.

## Références officielles consultées

- [Compatibilité Angular / Node / TypeScript](https://angular.dev/reference/versions)
- [Environnement Capacitor 8 et Xcode](https://capacitorjs.com/docs/getting-started/environment-setup)
- [Migration Capacitor 8 et choix CocoaPods](https://next.capacitorjs.com/docs/next/updating/8-0)
- [Configuration Apple du plugin](https://github.com/capawesome-team/capacitor-firebase/blob/main/packages/authentication/docs/setup-apple.md)
- [Configuration Google du plugin](https://github.com/capawesome-team/capacitor-firebase/blob/main/packages/authentication/docs/setup-google.md)
- [Firebase Apple : configuration et révocation](https://firebase.google.com/docs/auth/ios/apple)
- [Firebase Apple Web : révocation](https://firebase.google.com/docs/auth/web/apple)
- [Firebase Messaging iOS : jetons APNs et FCM](https://firebase.google.com/docs/cloud-messaging/ios/get-started)

Les exemples sont adaptés au paquet Authentication **8.3.0 effectivement installé** (podspec et sources Swift inspectés), et non à une mise à niveau automatique vers les dernières dépendances.
