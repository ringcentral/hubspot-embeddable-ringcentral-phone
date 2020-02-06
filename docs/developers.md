no_breadcrumb:true

# Customizing RingCentral Embeddable Voice for HubSpot

Developers are free to customize their RingCentral integration with Hubspot by forking the project on github:

```bash
$ git clone https://github.com/ringcentral/hubspot-embeddable-ringcentral-phone.git
$ cd hubspot-embeddable-ringcentral-phone
$ npm i
```

## Create Your Apps

### RingCentral

On RingCentral you will need to create an application with your developer console. To create the app quickly, click the button below:

<a class="btn btn-primary" href="https://developer.ringcentral.com/new-app?name=Embeddable+HubSpot+App&desc=An+app+that+adds+a+RingCentral+phone+to+your+HubSpot+account.&public=false&type=BrowserBased&carriers=7710,7310,3420&permissions=Contacts,ReadAccounts,ReadCallLog,ReadContacts,ReadMessages,RingOut,VoipCalling&redirectUri=https://ringcentral.github.io/ringcentral-embeddable/redirect.html">Create RingCentral App</a>

### HubSpot

You will need to also create an application within HubSpot:

1. Visit [https://developers.hubspot.com/](https://developers.hubspot.com/).

2. Sign-up as necessary, and click "Create application."
    
    <img class="img-fluid" src="../img/hubspot-dev.png">

3. Give your app a name, and select "Private."

4. You will be directed to a listing of your apps.

5. Edit the app you just created.

6. Under Scopes, select "Basic OAuth functionality."

7. Under "Read from and write to my" select "Contacts."

8. Click "Save."

## Edit config.js

You will need to create your config file using the template provided:

```bash
$ cp config.sample.js config.js
```

Look for the following section, and enter in your RingCentral Client ID, and set the server to the proper environment:

```json
//// ringcentral config
ringCentralConfigs: {
  // your ringCentral app's Client ID
  // clientID: 'aaaaaaaseWivhrrGgggVeCrw',

  // your ringCentral app's Auth Server URL
  // appServer: 'https://platform.devtest.ringcentral.com'
},
```

Finally, fill out the configuration information for your HubSpot application. Look for the following section and fill out accordingly (you should only need to provide your Client ID and Secret):

```json
thirdPartyConfigs: {
  // hubspot app client ID, required
  // get it from your hubspot app, https://app.hubspot.com/developer
  clientIDHS: ,
  // hubspot app client Secret,
  clientSecretHS: ,
  // hubspot app auth server, not required
  // appServerHS: 'https://app.hubspot.com',
  // hubspot app api server, not required
  // apiServerHS: 'https://app.hubspot.com',
  // hubspot app redirect uri, not required
  // appRedirectHS: 'https://zxdong262.github.io/hubspot-embeddable-ringcentral-phone/app/redirect.html',
  // show call log sync desc form or not
  // showCallLogSyncForm: true
},
```

## Start Up

You are ready to start up your app. 

```bash
$ npm start
```

## Customize Your Integration

To customize your integration, edit the many `.js` files in the `src` directory. As you edit, webpack will rebuild automatically.

## Install Your Extension

1. Open your [Chrome extension page](chrome://extensions/).
    
    <img src="../img/chrome.png" class="img-fluid">

2. Turn on "Developer mode" in the upper right hand corner if it is turned off.

3. Click "Load unpacked."

4. Select the `hubspot-embeddable-ringcentral-phone/dist` folder, and click "Select."

