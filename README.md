# SailThru Proxy Server for iOS Universal Links

## What?
SailThu does not support universal links, so you cannot trigger yoru iOS apps to open via a SailThru email.  They lack HTTPS capabilties, and the ability to host an external file (the required `apple-app-site-association` file).  

But we can hack around this via some DNS tricks and this small server!  This app will be the real host for your company-specific CNAME to `http://cb.sailthru.com`, and it will pass all traffic to them as a proxy.

Now you can HTTPS-enable this application, and serve the requsite JSON payload... all while still tracking your Email clicks and relying on SailThru to respond with the proper URL re-write data and UTM* tracking variables!

## Install
- `git@github.com:taskrabbit/sailthru-proxy.git`
- `npm install`

## Testing
- Start up some other server you want to test, like perhaps a rails app
- `PROXY_TARGET=http://localhost:3000 PORT=8080 npm start`

## Production
- `PROXY_TARGET=http://cb.sailthru.com PROXY_HOST=sailthru-links.taskrabbit.com npm start`