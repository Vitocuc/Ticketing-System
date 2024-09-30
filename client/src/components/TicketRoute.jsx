import { Button, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { TicketTable } from './TicketTable.jsx';

function TicketRoute(props) {
  const { ticketList, errorMsg,setErrorMsg, loggedIn, user, renewToken, authToken} = props

  return (

    <>
      {props.errorMsg ? <Row><Col><Alert className="m-2"
        variant="danger" dismissible onClose={() => props.setErrorMsg('')} >
        {props.errorMsg}</Alert></Col></Row> : null}
      <Row>
        <Col>
          {loggedIn ? <Link to={'/add'}>
            <Button variant="primary" className="my-2">Add new Ticket</Button>
          </Link> : null}
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Tickets</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <TicketTable listOfTickets={ticketList} loggedIn={loggedIn} loggedUser={user} renewToken={renewToken} authToken={authToken}/>
        </Col>
      </Row>

    </>
  );
}
export { TicketRoute };