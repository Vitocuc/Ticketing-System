import { useState } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function BlockForm(props) {
    const navigate = useNavigate();

    const { ticketId } = props;
    const { loggedUser } = props;



    const [text, setText] = useState('');

    const [errorMsg, setErrorMsg] = useState('');


    function handleSubmit(event) {
        event.preventDefault();
        //console.log('Submit was clicked');

        // Form validation

        if (text === '')
            setErrorMsg('Invalid text');
        else {
            // estimation time
            const e = {
                // description: description,
                text: text,
                ticketId: ticketId
            }
            // estimated_time = e.title.replace(/ /g, "").length + e.category.replace(/ /g, "").length
            props.addBlock(e);
            setText('');
        }
    }

    return (
        <>
            {errorMsg ? <Alert variant='danger' dismissible onClose={() => setErrorMsg('')}>{errorMsg}</Alert> : false}
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label>Text</Form.Label>
                    <Form.Control as="textarea" name="text" value={text} onChange={(event) => setText(event.target.value)} />
                </Form.Group>
                <Form.Group>
                    <Button type='submit' variant="primary">Add</Button>
                    <Button variant='warning' onClick={() => { setText("") }}>Cancel</Button>
                </Form.Group>
            </Form>

        </>
    )
}
export { BlockForm }