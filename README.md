# A really simple node proxy
HACKZOR for sailthru

## Testing
- Start up some other server you want to test, like perhaps a rails app
- `PROXY_TARGET=http://localhost:3000 PORT=8080 npm start`

## Production
- `PROXY_TARGET=http://cb.sailthru.com PROXY_HOST=http://sailthru-links.taskrabbit.com npm start`