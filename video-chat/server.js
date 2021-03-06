const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const twilio = require('twilio');
const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const app = express();

app.get('/token', function(request, response) {
  var identity = request.query.identity;

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created.
  var token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  );

  // Assign the generated identity to the token.
  token.identity = identity;

  // Grant the access token Twilio Video capabilities.
  var grant = new VideoGrant();
  token.addGrant(grant);

  // Serialize the token to a JWT string and include it in a JSON response.
  response.send({
    identity: identity,
    token: token.toJwt()
  });
});

const public = path.join(__dirname, './public');
app.use('/', express.static(public));

var options = {
    key: fs.readFileSync('./cert/sslkey.pem'),
    cert: fs.readFileSync('./cert/sslcert.pem'),
};
const httpServer=http.createServer(app);
const httpsServer=https.createServer(options,app);

httpServer.listen(80, function() {
  console.log('Express server running on *:80');
});

httpsServer.listen(443, function() {
  console.log('Express server running on *:443');
});
