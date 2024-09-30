'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');

const { expressjwt: jwt } = require('express-jwt');

const jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';


// init express
const app = express();
const port = 3002;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

// Check token validity
app.use(jwt({
  secret: jwtSecret,
  algorithms: ["HS256"],
  // token from HTTP Authorization: header
})
);


// To return a better object in case of errors
app.use( function (err, req, res, next) {
  console.log("DEBUG: error handling function executed");
  if (err.name === 'UnauthorizedError') {
    // Example of err content:  {"code":"invalid_token","status":401,"name":"UnauthorizedError","inner":{"name":"TokenExpiredError","message":"jwt expired","expiredAt":"2024-05-23T19:23:58.000Z"}}
    res.status(401).json({ errors: [{  'param': 'Server', 'msg': 'Authorization error', 'path': err.code }] });
  } else {
    next();
  }
} );


/*** APIs ***/

// could also be used to set some expiration date and so on

// POST /api/estimate
app.post('/api/estimate', (req, res) => {
  console.log('DEBUG: req.auth: ',req.auth);

  const ticket = req.body.ticket; // to seen if work
  const authAccessLevel = req.auth.access;
  let estimatedTime;
  if(ticket.state == 'open'){
  if (authAccessLevel === 'admin') { // show the estimation time in hour
    estimatedTime = (ticket.title.replace(/ /g, "").length + ticket.category.replace(/ /g, "").length)*10 + Math.floor(Math.random()*239)+1;

  } else if (authAccessLevel === 'user') { // show the estimation time in days
    estimatedTime = Math.floor(((ticket.title.replace(/ /g, "").length + ticket.category.replace(/ /g, "").length)*10 + Math.floor(Math.random()*239)+1) /24);
  }
  res.json({estimatedTime: estimatedTime});
  }else{
    res.status(401).json({ error: 'Ticket is closed, you cannot have the estimated time' });
  }
  
});




/*** Other express-related instructions ***/

// Activate the server
app.listen(port, () => {
  console.log(`Second Ticket Server listening at http://localhost:${port}`);
});