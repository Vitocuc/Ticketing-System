import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Outlet, Link, Navigate } from 'react-router-dom';

import { MyFooter } from './components/MyFooter.jsx';
import { MyHeader } from './components/MyHeader.jsx';
import { TicketRoute } from './components/TicketRoute.jsx';
import { LoginForm } from './components/AuthComponent.jsx';
import { TicketForm } from './components/TicketForm.jsx';
import { ConfirmationPage } from './components/ConfirmationPage.jsx';


import API from './API.js';

function DefaultRoute(props) {
  return (
    <Container fluid>
      <p className="my-2">No data here: This is not a valid page!</p>
      <Link to='/'>Please go back to main page</Link>
    </Container>
  );
}

function App() {

  // state moved up into App
  const [tickets, setTickets] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dirty, setDirty] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');

  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);

  const [authToken, setAuthToken] = useState(null);
  const [ticketToBeConfermed, setTicketToBeConfermed] = useState(null);


  function handleError(err) {
    console.log('handleError: ', err);
    let errMsg = 'Unkwnown error';
    if (err.errors) {
      if (err.errors[0].msg) {
        errMsg = err.errors[0].msg;
      }
    } else {
      if (err.error) {
        errMsg = err.error;
      }
    }
    setErrorMsg(errMsg);

    if (errMsg === 'Not authenticated')
      setTimeout(() => {  // do logout in the app state
        setUser(undefined); setLoggedIn(false); setDirty(true)
      }, 2000);
    else
      setTimeout(() => setDirty(true), 2000);  // Fetch the current version from server, after a while
  }

  const renewToken = () => {
    console.log("Did the renewToken")
    API.getAuthToken()
      .then((resp) => setAuthToken(resp.token))
      .catch(() => { });
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
        console.log("Renew token in check authentication")
        renewToken();
      } catch (err) {
        // NO need to do anything: user is simply not yet authenticated
        //handleError(err);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (dirty) {
      API.getAllTickets()
        .then((tickets) => {
          setTickets(tickets);
        })
        .catch((err) => console.log(err));
      setDirty(false);
    }
  }, [dirty]);



  function editTicket(ticket) {
    API.editTicket(ticket)
      .then(() => { setDirty(true); })
      .catch((err) => handleError(err));
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(undefined);
    // setDirty ... ?
    /* set state to empty if appropriate */
    setAuthToken(null);  // NB: this does not invalidate token, it just removes it from the app

  }

  const loginSuccessful = (user) => {
     (user);
    setLoggedIn(true);
    setDirty(true);  // load latest version of data, if appropriate
    console.log("Sono in login successfull")
    API.getAuthToken().then((resp) => setAuthToken(resp.token)).catch(() => { });
  }



  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout user={user} loggedIn={loggedIn} logout={doLogOut} appName={'Ticketing System'} />}>
          <Route index element={<TicketRoute ticketList={tickets}
            setTickets={setTickets}
            initialLoading={initialLoading}
            loggedIn={loggedIn}
            user={user}
            errorMsg={errorMsg} setErrorMsg={setErrorMsg}
            authToken={authToken} renewToken={renewToken}
          />} />
          <Route path='login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm loginSuccessful={loginSuccessful} />} />
          <Route path='add' element={!loggedIn ? <Navigate replace to='/' /> : <TicketForm ticketList={tickets} ticketToBeConfermed={ticketToBeConfermed} setTicketToBeConfermed={setTicketToBeConfermed} loggedUser={user} editTicket={editTicket} authToken={authToken} renewToken={renewToken}></TicketForm>} />
          <Route path='edit/:ticketId' element={!loggedIn ? <Navigate replace to='/' /> : <TicketForm ticketList={tickets} loggedUser={user} editTicket={editTicket} ></TicketForm>} />
          <Route path='confirmation' element={!loggedIn ? <Navigate replace to='/' /> : <ConfirmationPage setDirty={setDirty} authToken={authToken} ticket={ticketToBeConfermed} renewToken={renewToken} handleError={handleError} setTicketToBeConfirmed={setTicketToBeConfermed} user={user}></ConfirmationPage>} />

        </Route>
        <Route path='*' element={<DefaultRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

function Layout(props) {
  return (
    <Container fluid>
      <Row>
        <Col>
          <MyHeader user={props.user} loggedIn={props.loggedIn} logout={props.logout} appName={props.appName} />
        </Col>
      </Row>
      <Outlet />
      <Row>
        <Col>
          <MyFooter />
        </Col>
      </Row>
    </Container>
  )
}

export default App
