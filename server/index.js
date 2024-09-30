'use strict';
const dayjs = require('dayjs');
const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, validationResult } = require('express-validator'); // validation middleware

// initialize module for login and session
const LocalStrategy = require('passport-local'); // username and password for login
const session = require('express-session'); // enable sessions


// initiliazing dao
const dao = require('./dao'); // module for accessing the DB.  NB: use ./ syntax for files in the same dir
// add userDao to access the user info in the DB
const userDao = require('./dao-user'); // module for accessing the user info in the DB

const jsonwebtoken = require('jsonwebtoken');
const jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';
const expireTime = 60; //seconds


// defining CORS + options
const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};


const passport = require('passport'); // auth middleware

// init express
const app = new express();
const port = 3001;

const delay = 0;


// set up the middleware
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json
app.use(cors(corsOptions));
/* APIs */


// LOGIN STRATEGIES -------------------------

// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username or password.' }); // false if the authentication failed

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize only the user id and store it in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'Not authenticated' });
}

// set up the session
app.use(session({
  secret: 'wge8d239bwd93rkskb',   // change this random string, should be a secret value
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());



// USERS ------------------------------------------------------

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated user!' });;
});


// TICKETS AND BLOCKS ---------------------------------------------------

// GET /api/tickets
app.get('/api/tickets', (req, res) => {
  dao.listTickets()
    .then(tickets => res.json(tickets))
    .catch(() => res.status(500).end());
});



// GET /api/tickets/<id>/blocks
app.get('/api/tickets/:id/blocks', isLoggedIn, async (req, res) => {
  try {
    const resultTicket = await dao.getTicket(req.params.id);
    //console.log('Ticket: ' + JSON.stringify(resultTicket));
    if (resultTicket.error)
      res.status(404).json(resultTicket);   // TicketId does not exist
    else {
      const result = await dao.listBlocksByTicket(req.params.id);
      if (result.error)
        res.status(404).json(result);
      else
        setTimeout(() => res.json(result), delay);  // NB: list of blocks can also be an empty array
    }
  } catch (err) {
    res.status(500).end();
  }
});

// POST /api/tickets
app.post('/api/tickets', isLoggedIn, [
  check('category').isString().isIn(['inquiry', 'maintenance', 'new feature', 'payment', 'administrative']),
  check('title').isString().trim().isString().isLength({ min: 1 }),
  check('description').trim().isString().isLength({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    const ticket = {
      category: req.body.category,
      owner: req.user.username,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      title: req.body.title,
      description: req.body.description,
      ownerId: req.user.id
    };
    try {
      const newTicket = await dao.createTicket(ticket);
      setTimeout(() => res.status(201).json(newTicket), delay);
    } catch (err) {
      console.log(err)
      res.status(503).json({ error: `Database error during the creation of ticket by ${ticket.owner}.` });
    }

  } else {
    console.log(errors)
    return res.status(422).json({ errors: errors.array() });
  }

});

// PUT /api/tickets/<id>
app.put('/api/tickets/:id', isLoggedIn, [
  check('category').isString().isIn(['inquiry', 'maintenance', 'new feature', 'payment', 'administrative']),
  check('state').isString().isIn(['close', 'open']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const ticket = req.body;

  ticket.id = req.params.id;
  try {
    let numRowChanges = null;
    if (req.user.role == 'user') {
      console.log(req.user.id)
      numRowChanges = await dao.updateTicketByUser(ticket, req.user.id);
      console.log(numRowChanges)
    }
    else {
      numRowChanges = await dao.updateTicketAdmin(ticket);
    }

    setTimeout(() => res.json(numRowChanges), delay);
    //res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(503).json({ error: `Database error during the update of ticket ${req.params.id}.` });
  }

});

// POST /api/tickets/blocks
app.post('/api/tickets/blocks',
  isLoggedIn, [
  check('text').isString().trim().isString().isLength({ min: 1 }),
  check('ticketId').isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    const block = {
      text: req.body.text,
      author: req.user.username,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      ticketId: req.body.ticketId
    };
    //console.log(block)
    try {
      const result = await dao.getTicket(req.body.ticketId);
      if (result.error)
        res.status(404).json(result);
      else {
        if (result.state == 'open') {
          const newBlock = await dao.createBlock(block);
          setTimeout(() => res.status(201).json(newBlock), delay);
        }else{
          res.status(403).json({error:'The ticket is closed, you cannot add blocks :)'});
        }
      }
    } catch (err) {
      console.log(err)
      res.status(503).json({ error: `Database error during the creation of ticket by ${block.author}.` });
    }

  } else {
    console.log(errors)
    return res.status(422).json({ errors: errors.array() });
  }

});

/*** Token ***/

// GET /api/auth-token
app.get('/api/auth-token', isLoggedIn, (req, res) => {
  let authRole = req.user.role;

  const payloadToSign = { access: authRole, authId: 1234 };
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, { expiresIn: expireTime });
  res.json({ token: jwtToken, authRole: authRole });  // authRole is just for debug. Anyway it is in the JWT payload
});



// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});