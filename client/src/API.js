import dayjs from "dayjs";

const URL = 'http://localhost:3001/api';

async function getAllTickets() {
  // call  /api/tickets
  const response = await fetch(URL+'/tickets');
  const tickets = await response.json();
  if (response.ok) {
    return tickets.map((e) => ({id: e.id, category:e.category, state: e.state, owner: e.owner, title: e.title, timestamp: dayjs(e.timestamp), ownerId: e.ownerId}) );
  } else {
    throw tickets;  // expected to be a json object (coming from the server) with info about the error
  }
}



async function getBlocksByTicket(ticket){
   // call  /api/tickets/:id/blocks
   const response = await fetch(`${URL}/tickets/${ticket.id}/blocks`,{credentials: 'include'});
   const blocksByTicket = await response.json();
   if (response.ok) {
     return blocksByTicket.map((e) => ({id: e.id, text:e.text,author: e.author, tickedId: e.oticketId, timestamp: dayjs(e.timestamp)}));
   } else {
     throw blocksByTicket;  // expected to be a json object (coming from the server) with info about the error
   }

}

async function addTicket(ticket){
    // call  POST /api/tickets
    return new Promise((resolve, reject) => {
      fetch(URL+`/tickets`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.assign({}, ticket)),
      }).then((response) => {
        if (response.ok) {
          response.json()
            .then((id) => resolve(id))
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
      }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
  }
async function editTicket(ticket){
    // call  PUT /api/tickets/<id>
    return new Promise((resolve, reject) => {
      fetch(URL+`/tickets/${ticket.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.assign({}, ticket)),
      }).then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
      }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
}
async function logIn(credentials) {
  let response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  await fetch(URL+'/sessions/current', {
    method: 'DELETE', 
    credentials: 'include' 
  });
}

async function getUserInfo() {
  const response = await fetch(URL+'/sessions/current', {
    credentials: 'include'
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}

async function addBlock(block){
      // call  POST /api/tickets/:id/blocks
      return new Promise((resolve, reject) => {
        fetch(URL+`/tickets/blocks`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(Object.assign({}, block)),
        }).then((response) => {
          if (response.ok) {
            response.json()
              .then((id) => resolve(id))
              .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
          } else {
            // analyze the cause of error
            response.json()
              .then((message) => { reject(message); }) // error message in the response body
              .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
          }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
      });
}

async function getAuthToken() {
  const response = await fetch(URL+'/auth-token', {
    credentials: 'include'
  });
  const token = await response.json();
  if (response.ok) {
    return token;
  } else {
    throw token;  // an object with the error coming from the server
  }
}

async function getEstimate(authToken,ticket){
  // retrieve info from an external server, where info can be accessible only via JWT token
  const response = await fetch('http://localhost:3002'+`/api/estimate`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ticket: ticket}),
  });
  const info = await response.json();
  if (response.ok) {
    return info;
  } else {
    throw info;  // expected to be a json object (coming from the server) with info about the error
  }


}




const API = {getAllTickets,getBlocksByTicket,logIn,logOut,getUserInfo,addTicket,editTicket,addBlock,getAuthToken,getEstimate};
export default API;
