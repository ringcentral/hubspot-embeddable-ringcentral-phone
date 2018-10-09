# RingCentral Embeddable Voice for HubSpot(chrome extension)
Add [RingCentral Embeddable Voice widgets](https://github.com/ringcentral/ringcentral-embeddable) to hubspot contacts list and call contact page with chrome extension.

Created with [Embbnux Ji](https://github.com/embbnux)'s tuturial:
 [Building Chrome Extension Integrations with RingCentral Embeddable](https://medium.com/ringcentral-developers/build-a-chrome-extension-with-ringcentral-embeddable-bb6faee808a3)

## Youtube video
https://youtu.be/tRjG4aOquv8

## Screenshots
| screenshots            |  screenshots |
:-------------------------:|:-------------------------:
![hubspot-btn2](screenshots/hubspot-btn2.png) | ![hubspot-btn2](screenshots/hubspot1.png)
![hubspot-list2](screenshots/hubspot-list2.png) | ![hubspot-list2](screenshots/hs1.png)
![hubspot-list2](screenshots/hs2.png) | ![hubspot-list2](screenshots/hs3.png)
![hubspot-list2](screenshots/hs4.png) | ![hubspot-list2](screenshots/hs5.png)


## Features
- Click to call button
- Popup caller/callee info panel when call inbound
- build with custom app config

## try it with private crx package
- Download the private crx from release page: https://github.com/zxdong262/hubspot-embeddable-ringcentral-phone/releases
- Open your chrome extension page(chrome://extensions/), drag the crx file to the extension page to install.
- Go to `https://app.hubspot.com` to check

## Custombuild and use

1. build `content.js`
```bash
git clone https://github.com/zxdong262/hubspot-embeddable-ringcentral-phone.git
cd hubspot-embeddable-ringcentral-phone
npm i
cp config.sample.js config.js
# edit config.js, fill the required thirdPartyConfigs.clientIDHS and thirdPartyConfigs.clientSecretHS
# you can get the ID/Secret from https://app.hubspot.com/developer, register and create an app,
# make sure you have Scopes: Basic OAuth functionality, and Read from and write to my: Contacts checked.

# then run it
npm start
# edit src/*.js, webpack will auto-rebuild
```

2. Go to Chrome extensions page.
3. Open developer mode
4. Load `hubspot-embeddable-ringcentral-phone/dist` as unpacked package.
5. Go to `https://app.hubspot.com` to check

## Build with custom RingCentral clientID/appServer

- Create an app from https://developer.ringcentral.com/, make sure you choose a browser based app, and set all permissions, and add `https://ringcentral.github.io/ringcentral-embeddable/redirect.html` to your redirect URI list, Edit `config.js`,
- Fill your RingCentral app's clientID and appServer in `config.js`
```js

  ringCentralConfigs: {
    // your ringCentral app's Client ID
    clientID: 'your-clientID',

    // your ringCentral app's Auth Server URL
    appServer: 'your ringCentral app Auth Server URL'
  },
```

## Cli tool
You can use [ringcentral-embeddable-extension-factory](https://github.com/zxdong262/ringcentral-embeddable-extension-factory) to create similar extensions.

## License
MIT

