// All the exported functions in this file, represent the requests, the client side sends to JumpCloud backend.
//
// Express server will first intercept these requests (via the proxy property specified in this client's package.json)
// because this client just proxies these requests to the url where Express server runs.
//
// Once then express server gets these requests, it will forward them
// to JumpCloud backend --- via the app.get('/api/systemusers') handler  (see server/server.js).

/**
 * 
 * @param {Function} callback The callback to be used when we fetched results. 
 */
export const getExistingUsers = (callback = f => f) => {
    fetch('/api/systemusers')   // method is implied to be: GET
      .then(result => {
        //console.log('--> ', result)
        if (!result.ok) {
            // We have an error response from server
        }
        return result.json()
      })
      .then(body => {
        if (body.error) {
          callback({}, body.error.status, body.message)
        } else {
          callback(body)
        }
      })
      .catch(error => {
          // This is for handling client's own issues
          console.log('Client side got error: ', error)
          callback({}, '(Local Error) Failed to fetch users', error.message)
      })
}

export const getExistingUser = (userId, callback = f => f) => {
  console.log('Fetching user with id: ', userId)

  fetch('/api/systemusers/' + userId, {method: 'GET'})
    .then(result => {
      //console.log('--> ', result)
      if (!result.ok) {
          // We have an error response from server
      }
      return result.json()
    })
    .then(body => {
      if (body.error) {
        callback({}, body.error.status, body.message)
      } else {
        callback(body)
      }
    })
    .catch(error => {
        // This is for handling client's own issues
        console.log('Client side got error: ', error)
        callback({}, '(Local Error) Failed to fetch one user', error.message)
    })
}

/**
 * @param {number} userId The unique identifier for a given user.
 * @param {Function} callback The callback to be used when we deleted a user. 
 */
 export const deleteUser = (userId, callback = f => f) => {
    console.log('Deleting existing user with id: ', userId)

    fetch( '/api/systemusers/' + userId, {method: 'DELETE'} )
      .then(result => {
        //console.log('--> ', result)
        if (!result.ok) {
            // We have an error response from server
        }
        return result.json()
      })
      .then(body => {
        if (body.error) {
          callback({}, body.error.status, body.message)
        } else {
          callback(body)
        }
      })
      .catch(error => {
          // This is for handling client's own issues
          console.log('Client side got error: ', error)
          callback({}, '(Local Error) Failed to delete user(s)', error.message)
      })
}

export const createNewUser = (user, callback = f => f) => {
   console.log('Adding a new user ', user)

   // POST examples shown here: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
   fetch( '/api/systemusers', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(user)} )
      .then(result => {
        //console.log('--> ', result)
        if (!result.ok) {
            // We have an error response from server
        }
        return result.json()
      })
      .then(body => {
        if (body.error) {
          callback({}, body.error.status, body.message)
        } else {
          callback(body)
        }
      })
      .catch(error => {
          // This is for handling client's own issues
          console.log('Client side got error: ', error)
          callback({}, '(Local Error) Failed to create user', error.message)
      })
}

export const updateUser = (user, callback = f => f) => {
   console.log('Updating existing user with id: ', user.id)

   fetch( '/api/systemusers/' + user.id, {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(user)} )
      .then(result => {
        //console.log('--> ', result)
        if (!result.ok) {
            // We have an error response from server
        }
        return result.json()
      })
      .then(body => {
        if (body.error) {
          callback({}, body.error.status, body.message)
        } else {
          callback(body)
        }
      })
      .catch(error => {
          // This is for handling client's own issues
          console.log('Client side got error: ', error)
          callback({}, '(Local Error) Failed to update user', error.message)
      })
}

