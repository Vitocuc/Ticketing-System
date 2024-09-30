import {Navbar, Button} from 'react-bootstrap'
import { Link } from 'react-router-dom'; 

function MyHeader(props) {
	const name = props.user && props.user.username;
  
	  return (
		  <Navbar bg="primary" variant="dark" className="d-flex justify-content-between">
		<Navbar.Brand className="mx-2">
		  <i className="bi bi-collection-play" />
		  {/* props.appName just in case you want to set a different app name */}
		  {props.appName || "HeapOverrun"}
		</Navbar.Brand>
		{name ? <div>
		  <Navbar.Text className='fs-5'>
			{"Signed in as: " + name}
		  </Navbar.Text>
		  <Button className='mx-2' variant='danger' onClick={props.logout}>Logout</Button>
		</div> :
		  <Link to='/login'>
			<Button className='mx-2' variant='warning'>Login</Button>
		  </Link>}
	  </Navbar>
	);
  }
export {MyHeader};