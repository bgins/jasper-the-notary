# Welcome to Jasper's notarization service

Hi there! My name is Jasper, and I am a notary and general assistant.

![](jasper.png)

You've probably come here because you want to find your way through the Halls of Authorization. And let me guess -- BLINKERTON_LKM sent you? 

I can help you create to create a DID and to create and sign UCANs with it. To get started, you'll need to pay my fees:

```
npm install
```

Then we have a bit of initial paperwork:

```
npm run build
```

Alright! Now that we're through all those prelimiaries, let's get you set up with a DID and a UCAN to register with BLINKERTON_LKM.

Go ahead and create a file named `BLINKERTON_LKM` and copy Ole Blinky's DID into it. Once you've got that, we can get you registered:

```
npm run auth
```

That's the UCAN you'll need at the `/registry`. Just set it as a `Bearer` token and make a `GET` request with an HTTP client of your choosing.

Each time you need a UCAN in the future, I'll need the door name and a proof UCAN that Blinky will give you:

```
npm run auth <door-name> <proof-ucan>
```

I'll take those and create a UCAN for the door you request.

Thank you for choosing Jasper the Notary! We provide the highest quality signatures and verifications. With Jasper on your team, UCAN open all doors and ever be winning. 🙌