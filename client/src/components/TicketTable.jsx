import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Row, Col, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { BlockForm } from './BlockForm.jsx'
import API from '../API.js';

import { useNavigate } from 'react-router-dom';

function BlockRow(props) {
  const e = props.block;
  return (
    <Card className="my-3">
      <Card.Body>
        <Row>
          <Col><pre>{e.text}</pre></Col>
          <Col>{e.author}</Col>
          <Col>{e.timestamp.format("YYYY-MM-DD HH:mm:ss")}</Col>
        </Row>
      </Card.Body>
    </Card>

  );
}

function BlockTable(props) {
  const { loggedUser } = props
  return (
    <div>
      {props.listBlocks.map((e, index) =>
        <BlockRow key={index} block={e} loggedUser={loggedUser} />)
      }
    </div>

  )
}

function TicketRow(props) {
  const e = props.ticket;
  const { loggedIn, loggedUser, authToken, renewToken } = props
  const navigate = useNavigate();
  const initialMessage = 'Estimate expiration time not given';  


  const [blockList, setBlockList] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const [estimation, setEstimation] = useState(null);

  const [dirty, setDirty] = useState(true)

  useEffect(() => {
    if (expanded) {
      API.getBlocksByTicket(e)
        .then((blocks) => setBlockList(blocks))
        .catch((err) => console.log(err));
    }
    setDirty(false);
  }, [dirty, expanded]);


  const loadEstimate = (authToken,ticket) => {
    console.log("This is the token in the estimate"+authToken)
      API.getEstimate(authToken,ticket)
      .then((res) => setEstimation(res.estimatedTime))
      .catch((err) => {console.log('I failed the estimation and im asking a new token'); setEstimation(initialMessage); renewToken(); })
    }

  useEffect(() => {
    if(loggedIn && authToken) {
      loadEstimate(authToken,e)

    }
  }, [authToken]);  

  function addBlock(block) {
    API.addBlock(block)
      .then(() => {
        setDirty(true);
      })
      .catch((err) => console.log(err));
  }

  return (
    <Card className="my-3">
      <Card.Body>
        <Card.Header className="bg-primary text-white">{e.title}</Card.Header>
        <Row className="justify-content-md-center">
          <Card.Title>Category</Card.Title>
          <Card.Text>{e.category}</Card.Text>
          <Card.Title>Owner</Card.Title>
          <Card.Text>{e.owner}</Card.Text>
          <Card.Title>State</Card.Title>
          <Card.Text>{e.state}</Card.Text>
          <Card.Title>Timestamp</Card.Title>
          <Card.Text>{e.timestamp.format("YYYY-MM-DD HH:mm:ss")}</Card.Text>
          {loggedIn && loggedUser.role === 'admin' && e.state=='open'?
            <div>
              <Card.Title>Estimated time(in hours)</Card.Title>
              <Card.Text>{estimation}</Card.Text>
            </div>

            :
            null
          }

        </Row>
        <Row>
          <Col>{loggedIn ? <Button onClick={() => { expanded ? setExpanded(false) : setExpanded(true) }}><i className="bi bi-arrows-angle-expand"></i></Button> : null}</Col>
          {loggedUser != undefined ?
            loggedUser.role == 'admin' ?
              <Col><Button onClick={() => { navigate(`/edit/${e.id}`) }}>Edit</Button></Col>
              :
              loggedUser.role == 'user' & loggedUser.id == e.ownerId ?
                <Col><Button onClick={() => { navigate(`/edit/${e.id}`) }}>Edit</Button></Col>
                : null
            : null
          }
        </Row>


        <Row>
          {expanded & loggedIn ?
            <div>
              <BlockTable listBlocks={blockList} loggedUser={loggedUser}></BlockTable>
              {e.state == 'open'?
              <BlockForm ticketId={e.id} addBlock={addBlock}></BlockForm>
              : null}
            </div> :
            null
          }
        </Row>


      </Card.Body>

    </Card>

  );
}

function TicketTable(props) {
  const { loggedIn, loggedUser, authToken, renewToken} = props
  return (
    <div>
      {props.listOfTickets.map((e, index) =>
        <TicketRow key={index} ticket={e} authToken={authToken} loggedIn={loggedIn} loggedUser={loggedUser} renewToken={renewToken} />)
      }
    </div>
  )
}

export { TicketTable };