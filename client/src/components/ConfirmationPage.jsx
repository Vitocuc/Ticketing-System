import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import API from '../API'; // Adjust the path to your actual API module
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


function ConfirmationPage(props) {
    const initialMessage = 'Estimate expiration time not given';  
    const {setDirty,authToken, renewToken, ticket, handleError, setTicketToBeConfirmed,user} = props;

    const [estimate,setEstimate] = useState(null)
    const navigate = useNavigate();
    const loadEstimate = (authToken,ticket) => {
    console.log(authToken)
      API.getEstimate(authToken,ticket)
      .then((res) => setEstimate(res.estimatedTime))
      .catch((err) => {console.log(err); setEstimate(initialMessage); renewToken(); })
    }
  
    function handleSubmit(event) {
      event.preventDefault();
      console.log('Sto aggiungendo il ticket')
      API.addTicket(ticket)
      .then(() => { 
        setDirty(true);
        setTicketToBeConfirmed(null);

       })
      .catch((err) => handleError(err));
      navigate('/');

    }

    useEffect(() => {
        loadEstimate(authToken,ticket)
    }, [authToken]);  

    return (
      <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md="8">
          <Card className="text-center">
            <Card.Header>Confirmation</Card.Header>
            <Card.Body>
              <Card.Title>Title</Card.Title>
              <Card.Text>{ticket.title}</Card.Text>
              <Card.Title>Description</Card.Title>
              <Card.Text> {ticket.description}</Card.Text>
              <Card.Title>Category</Card.Title>
              <Card.Text>{ticket.category}</Card.Text>
              <Card.Title>State</Card.Title>
              <Card.Text>{ticket.state}</Card.Text>
              {user.role=='admin'?<Card.Title>Estimated time in hours</Card.Title>:
              <Card.Title>Estimated time in days</Card.Title>
              }
              
              <Card.Text>{estimate}</Card.Text>
              <Button type='submit' variant="primary" onClick={handleSubmit}>Confirm</Button>
              <Button variant='warning' onClick={() => { navigate('/add') }}>Cancel</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    );
  }

export {ConfirmationPage}