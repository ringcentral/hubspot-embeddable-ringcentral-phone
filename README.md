
# RingCentral Embeddable for HubSpot (Chrome extension) <!-- omit in toc -->

Add [RingCentral Embeddable Voice widgets](https://github.com/ringcentral/ringcentral-embeddable) to HubSpot contacts list and call contact page with Chrome extension.

Created with [ringcentral-embeddable-extension-factory](https://github.com/ringcentral/ringcentral-embeddable-extension-factory), you could create similar extension for other CRM sites.

## Table of contents <!-- omit in toc -->

- [Youtube video](#youtube-video)
- [Screenshots](#screenshots)
- [Features](#features)
- [Try it](#try-it)
- [Dev](#dev)
- [Credits](#credits)
- [License](#license)

## Youtube video

[https://youtu.be/N3fUhOkky7M](https://youtu.be/N3fUhOkky7M)

## Screenshots

| screenshots            |  screenshots |
:-------------------------:|:-------------------------:
![hubspot-btn2](docs/img/screenshots/ss1.jpg) | ![hubspot-btn2](docs/img/screenshots/ss2.jpg)
![hubspot-list2](docs/img/screenshots/ss3.jpg) | ![hubspot-list2](docs/img/screenshots/ss4.jpg)
![hubspot-list2](docs/img/screenshots/ss5.jpg) | ![hubspot-list2](docs/img/screenshots/ss6.jpg)
![hubspot-list2](docs/img/screenshots/ss7.jpg) | ![hubspot-list2](docs/img/screenshots/ss8.jpg)
![hubspot-list2](docs/img/screenshots/ss9.jpg) | ![hubspot-list2](docs/img/screenshots/ss1.jpg)

## Features

- Click to call button
- Popup callee info panel when call inbound
- Build with custom app config
- Auto/manually sync call log/voicemail/sms to hubspot, [About auto call log sync feature](https://github.com/ringcentral/hubspot-embeddable-ringcentral-phone/issues/137).
- Check hubspot activities from ringcentral contact panel
- Custom X-USER-AGENT header for api request
- Active call control
- Sync call log to deal
- Call log with call recording link
- Call from deal page
- Insert meeting content to HubSpot or sync meeting info to HubSpot
- Click to open schedule meeting page.
- Support RingCentral Video

## Try it

- Download the zip from release page: [https://github.com/ringcentral/hubspot-embeddable-ringcentral-phone/releases](https://github.com/ringcentral/hubspot-embeddable-ringcentral-phone/releases)
- Unpack it, get a dist folder, open your Chrome extension page(chrome://extensions/), make sure you **enable the developer mode**, click load unpacked, select the dist folder, for Firefox extnesion, choose Addon -> Enable add-on debugging -> Load Temporary Add-on -> Choose dist-firefox/menifest.json.
- Go to `https://app.hubspot.com` to check
- Make sure you ***turn off*** `Block third-party cookies` in `chrome://settings/content/cookies`

## Dev

```bash
npm i

# edit .env, fill in all required
cp sample.env .env

# download files needed
npm run down

# start
npm start

# then load dist folder as unpacked extension
```

## Credits

Created with [Embbnux Ji](https://github.com/embbnux)'s tuturial:
 [Building Chrome Extension Integrations with RingCentral Embeddable](https://medium.com/ringcentral-developers/build-a-chrome-extension-with-ringcentral-embeddable-bb6faee808a3)

## License

MIT
