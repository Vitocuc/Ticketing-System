import { useState } from 'react';
import { Button, Form, Alert, Row, Col, FormGroup, Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

function TicketForm(props) {
    return (
        <Row>
            <Col>
                
                <MyForm  editTicket={props.editTicket} loggedUser={props.loggedUser}
                    ticketList={props.ticketList} ticketToBeConfermed= {props.ticketToBeConfermed} setTicketToBeConfermed={props.setTicketToBeConfermed} />
            </Col>
        </Row>
    );
}

function MyForm(props) {
    const navigate = useNavigate();

    /* If we have an ticketId in the URL, we retrieve the answer to edit from the list.
    In a full-stack application, starting from the ticketId, 
    we could query the back-end to retrieve all the answer data (updated to last value). */

    const { ticketId } = useParams();
    const { loggedUser } = props;
    const {ticketToBeConfermed} = props;

    //console.log(ticketId);
    const objToEdit = ticketId && props.ticketList.find(e => e.id === parseInt(ticketId)); // checking if the object to edit exists
    //console.log(objToEdit);
    let ticket = ticketToBeConfermed;
    // if the ticket doesn't exist, supposed to be erased afer the confirmation
    if(ticket == null) (
        ticket = 
        {
        description: '',
        title: '',
        category: '',        
        state: ''
    })

    const [title, setTitle] = useState(objToEdit ? objToEdit.title : ticket.title);
    const [category, setCategory] = useState(objToEdit ? objToEdit.category : ticket.category);
    const [description, setDescription] = useState(objToEdit ? objToEdit.description : ticket.description);
    const [state, setState] = useState(objToEdit ? objToEdit.state : ticket.state);

    const [errorMsg, setErrorMsg] = useState('');

    function handleSubmit(event) {
        event.preventDefault();
        //console.log('Submit was clicked');

        // Form validation

        if (title === '')
            setErrorMsg('Invalid title');
        else if (category === '') {
            setErrorMsg('Invalid category');
        } else if (description === '') {
            setErrorMsg('Invalid description');
        }
        else {
            let e= null;
       

            //console.log(e);
            //console.log(props.editObj);

            if (objToEdit) {  // decide if this is an edit or an add
                e = {
                    category: category,
                    state: state
                }
                e.id = objToEdit.id;
                props.editTicket(e);
                navigate('/');
            } else {
                e = {
                    description: description,
                    title: title,
                    category: category,
                    state: state
                }
                e.state= 'open'
                props.setTicketToBeConfermed(e);
                console.log(e);
                navigate('/confirmation');
                
            }

        }
    }


    return (
        <>
            {errorMsg ? <Alert variant='danger' dismissible onClose={() => setErrorMsg('')}>{errorMsg}</Alert> : false}
            <Form onSubmit={handleSubmit}>
                {!objToEdit ?
                    <Container>

                        <Form.Group>
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="text" name="title" value={title} onChange={(event) => setTitle(event.target.value)} />
                        </Form.Group>


                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" name="description" value={description} onChange={(event) => setDescription(event.target.value)} />
                        </Form.Group>


                        <Form.Group>
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                                name="category"
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                            >
                                <option value="">Select a category</option>
                                <option value="inquiry">Inquiry</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="new feature">New Feature</option>
                                <option value="administrative">Administrative</option>
                                <option value="payment">Payment</option>
                            </Form.Select>
                            <Button type='submit' variant="primary">{objToEdit ? 'Save' : 'Add'}</Button>
                            <Button variant='warning' onClick={() => { navigate('/') }}>Cancel</Button>
                        </Form.Group></Container>

                    :
                    loggedUser.role == 'admin' ?
                        <Container>
                            <Form.Group>
                                <Form.Label>Category</Form.Label>
                                <Form.Select
                                    name="category"
                                    value={category}
                                    onChange={(event) => setCategory(event.target.value)}
                                >
                                    <option value="">Select a category</option>
                                    <option value="inquiry">Inquiry</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="new feature">New Feature</option>
                                    <option value="administrative">Administrative</option>
                                    <option value="payment">Payment</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>State</Form.Label>
                                <Form.Select
                                    name="state"
                                    value={state}
                                    onChange={(event) => setState(event.target.value)}
                                >
                                    <option value="">Select a state</option>
                                    <option value="open">Open</option>
                                    <option value="close">Close</option>
                                </Form.Select>

                                <Button type='submit' variant="primary">{objToEdit ? 'Save' : 'Add'}</Button>
                                <Button variant='warning' onClick={() => { navigate('/') }}>Cancel</Button>
                            </Form.Group>

                        </Container>
                        : loggedUser.role == 'user' ?
                            <Container>
                                <Form.Group>
                                    <Form.Label>State</Form.Label>
                                    <Form.Select
                                        name="state"
                                        value={state}
                                        onChange={(event) => setState(event.target.value)}
                                    >
                                        <option value="">Select a state</option>
                                        <option value="open">Open</option>
                                        <option value="close">Close</option>
                                    </Form.Select>
                                    <Button type='submit' variant="primary">{objToEdit ? 'Save' : 'Add'}</Button>
                                    <Button variant='warning' onClick={() => { navigate('/') }}>Cancel</Button>
                                </Form.Group>
                            </Container>
                            : null
                }
       


            </Form>
        </>
    );

}

export { TicketForm };