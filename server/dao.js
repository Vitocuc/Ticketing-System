'use strict';

/* Data Access Object (DAO) module for accessing tickets and Blocks */

const sqlite = require('sqlite3');
const dayjs = require('dayjs');

// open the database
const db1 = new sqlite.Database('ticketing.db', (err) => {
  if (err) throw err;
});



//USERS ------------------------------------
exports.listUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users';
    db1.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const users = rows.map((e) => ({ id: e.id, name: e.name, surname: e.surname, role: e.role }));
      resolve(users);
    });
  });

};

exports.getUser = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id=?';
    db1.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({ error: 'User not found.' });
      } else {
        const user = { id: e.id, name: e.name, surname: e.surname, role: e.role };
        resolve(user);
      }
    });
  });
};



// TICKETS ----------------------------------

// get all tickets
exports.listTickets = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM tickets ORDER BY timestamp DESC';
    db1.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const tickets = rows.map((e) => ({ id: e.id, category: e.category, state: e.state, owner: e.owner, title: e.title, timestamp: dayjs(e.timestamp), ownerId: e.ownerId }));
      resolve(tickets);
    });
  });
};

// get the ticket identified by {id}
exports.getTicket = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM tickets WHERE id=?';
    db1.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({ error: 'Ticket not found.' });
      } else {
        const ticket = { id: row.id, state: row.state, category: row.category, owner: row.owner, title: row.title, timestamp: dayjs(row.timestamp), ownerId: row.ownerId };
        resolve(ticket);
      }
    });
  });
};

// add a new ticket
exports.createTicket = (ticket) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO tickets(state,title,category, owner, timestamp,ownerId) VALUES(?, ?,?, ?, ?, ?)';
    db1.run(sql, ['open', ticket.title, ticket.category, ticket.owner, dayjs().format(), ticket.ownerId], function (err) {
      if (err) {
        reject(err);
        return;
      } else {
        // make a call with the block
        const sql2 = 'INSERT INTO blocks(text,author,timestamp,ticketId) VALUES(?,?,?,?)';
        db1.run(sql2, [ticket.description,ticket.owner,dayjs().format(),this.lastID], function (err) {
          if (err) {
            reject(err);
            return;
          } else {
            resolve(exports.getTicket(this.lastID));

          }

        })
      }
    });
  });

};

// get all the tickets given a user
exports.getTicketsByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM tickets WHERE ownerId=?';
    db1.get(sql, [userId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      if (rows == undefined) {
        resolve({ error: 'Tickets for the user not found.' });
      } else {
        const ticketsByUser = rows.map((e) => ({ id: e.id, name: e.name, surname: e.surname, role: e.role }));
        resolve(ticketsByUser);
      }
    });
  });

};

exports.updateTicketByUser = (ticket, userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE tickets SET state=? WHERE id = ? AND ownerId = ?';
    // It is MANDATORY to check that the ticket belongs to the userId
    db1.run(sql, [ticket.state, ticket.id,userId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });
};
exports.updateTicketAdmin = (ticket) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE tickets SET category=?, state=? WHERE id = ? ';
    db1.run(sql, [ticket.category, ticket.state, ticket.id], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });
};

// BLOCKS ----------------------------------


// add a new block, return the newly created object, re-read from DB
exports.createBlock = (block) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO blocks(text, author, timestamp, ticketId) VALUES(?, ?, ?, ?)';
    db1.run(sql, [block.text, block.author, dayjs().format(), block.ticketId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(exports.getBlock(this.lastID));
    });
  });

};

// get all blocks to a given ticket
exports.listBlocksByTicket = (ticketId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM blocks WHERE ticketId = ? ORDER BY timestamp';

    db1.all(sql, [ticketId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      //console.log('rows: '+JSON.stringify(rows));
      const blocks = rows.map((e) => (
        {
          id: e.id,
          text: e.text,
          author: e.author,
          timestamp: dayjs(e.timestamp),
          ticketId: e.ticketId,

        }));
      //console.log('Blocks: '+JSON.stringify(Blocks));
      resolve(blocks);
    });
  });

};


// get the block identified by {id}
exports.getBlock = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM blocks WHERE id=?';
    db1.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({ error: 'Block not found.' });

      } else {
        const block =
        {
          id: row.id,
          text: row.text,
          author: row.author,
          timestamp: dayjs(row.timestamp),
          ticketId: row.ticketId,
        };
        resolve(block);
      }
    });
  });
};

// update an existing block
exports.updateBlock = (block) => {
  //console.log('updateblock: '+JSON.stringify(block));
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE Blocks SET text=?, author=? timestamp=? WHERE id = ?';
    db1.run(sql, [block.text, block.author, block.timestamp, block.id], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });

};