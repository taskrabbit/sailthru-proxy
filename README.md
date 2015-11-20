# A really simple node proxy to trap Sailthru click tracking

## Huh?
Sailthu doesn't support universal links (no HTTPS, no ability to host an external file).  So, what we can do is do some DNS hackery!  This app will be the real host for your company-specific CNAME to `http://cb.sailthru.com`, and it will pass all traffic to them as a proxy.

Now you can HTTPS this host, and serve the requsite JSON payload.  

## Install
- `git@github.com:taskrabbit/sailthru-proxy.git`
- `npm install`

## Testing
- Start up some other server you want to test, like perhaps a rails app
- `PROXY_TARGET=http://localhost:3000 PORT=8080 npm start`

## Production
- `PROXY_TARGET=http://cb.sailthru.com PROXY_HOST=sailthru-links.taskrabbit.com npm start`