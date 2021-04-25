import React, { useState } from 'react'
import Typography from '@material-ui/core/Typography'
import './App.css'
import CustomDataGrid from './components/tables/CustomDataGrid'
import UserDetailsCard from './components/cards/UserDetailsCard'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { getExistingUsers, getExistingUser, deleteUser, createNewUser, updateUser } from './requests/jumpCloudRequests'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'

import { useStyles } from './styles/App_styles'

function App() {
  const classes = useStyles()

  // Used just for displaying eror messages due to failed network requests
  const [currentErrorStatus, setCurrentErrorStatus] = useState('')

  // Used just for displaying any other status (e.g. normal progress)
  // (both statuses will be displayed independent of each other)
  const [currentStatus, setCurrentStatus] = useState('')
  
  // All users fetched from backend
  const [users, setUsers] = useState([])

  // One (or more) user id(s) which have been selected with checkbox selector
  const [selectedUserIds, setSelectedUserIds] = useState([])

  // Wether to show details card or not
  const [showSelectedUserDetails, setShowSelectedUserDetails] = useState(false)
  const [selectedUserDetails, setSelectedUserDetails] = useState({})

  // keeps track on how many users are pending deletion ...
  let userCount = 0
  let errorOnDelete = false

  // For showing (or hiding a circular progress) on potentially lengthy RESTful operations 
  // (such as fetching all users or deleting a bunch of users)
  // We'll use a circular progress feedback to user because network request implies a non deterministic behavior
  // TODO: Handle timeout case when server is not responding (in which case we eventually need to hide the progress).
  const [requestInProgress, setRequestInProgress] = useState(false)

  const onUserSelected = (user, checked) => {
    if (user) {
      if (checked) { // checkbox is marked
        let newlySelectedIds = [...selectedUserIds, user.id]
        setSelectedUserIds(newlySelectedIds)
      } else { // checkbox is unmarked
        const newlySelectedUserIds = selectedUserIds.filter(selectedUserId => selectedUserId !== user.id)
        setSelectedUserIds(newlySelectedUserIds)
      }
      console.log('-->', selectedUserIds)
    }
  }

  const onUserDetailsSelected = (user) => {
    if (user) {
      if (user.id === selectedUserDetails.id) {
        // show (or hide) the user details card
        setShowSelectedUserDetails(!showSelectedUserDetails)

        // set (or clear) the user details
        showSelectedUserDetails ? setSelectedUserDetails({}) : setSelectedUserDetails(user)
      } else {
        setShowSelectedUserDetails(true)
        setSelectedUserDetails(user)
      }
    }
  }

  const onCreatingNewUser = () => {
    if (showSelectedUserDetails && Object.keys(selectedUserDetails).length === 0) {
      // Ignore if user wants to create a new user while a new is already in progress of being created
      console.log('ignoring further button clicks')
      return
    }
    setShowSelectedUserDetails(true)
    setCurrentErrorStatus('') // if there was a previous error, wipe it because we now try again
    setSelectedUserDetails({})
  }

  const saveUser = (user, isNewUser) => {
    // Close the details dialog. We're now going to send a request
    setShowSelectedUserDetails(false)
    setSelectedUserDetails({})

    // 1- Send network request. Depending on the value of 'isNewUser' 
    //    we'll send either a POST or a PUT to backend.
    if (isNewUser) {
      setCurrentStatus('Creating a new user ...')
      createNewUser(user, onUserCreated)
    } else {
      setCurrentStatus('Updating existing user ...')
      updateUser(user, onUserUpdated)
    }
  }

  const cancelSelectedUserDetails = () => {
    setShowSelectedUserDetails(false)
    setSelectedUserDetails({})
  }

/**
 * Callback associated with startFetchingAllUsers()
 * @param {Object} The body of the response (returned by the JumpCloud backend)
 */
 const onAllUsersFetched = (responseBody, errorStatus, errorMessage) => {
   setRequestInProgress(false) // error or success, we need to stop displaying the progress

   if (errorStatus) {
    setCurrentStatus('') // clear the message which shows a pending activity
    setCurrentErrorStatus(errorStatus + ': ' + errorMessage)
    return
   }

   if (currentErrorStatus) {
     // if any previous error message was displayed clear it, because we now got a result
     // (even if result may happen to contain no user)
     setCurrentErrorStatus('')
   }
   if (responseBody && responseBody.totalCount > 0) {
     //console.log('Got users: ', responseBody.results)
     setUsers(responseBody.results)
     setCurrentStatus('Retrieved ' + responseBody.results.length + ' users')
   } else {
     setUsers([])
     setCurrentStatus('No users provisioned')
   }
 }

 const onUserFetched = (responseBody, errorStatus, errorMessage) => {
  if (errorStatus) {
   setCurrentStatus('') // clear the message which shows a pending activity
   setCurrentErrorStatus(errorStatus + ': ' + errorMessage)
   return
  }

  if (currentErrorStatus) {
    // if any previous error message was displayed clear it, because we now got a result
    // (even if result may happen to contain no user)
    setCurrentErrorStatus('')
  }
  console.log('Fetched one user: ', responseBody)
  if (responseBody) {
    // Merge this result with the existing users, thus triggering a data refresh
    // NOTE: To avoid data mutation in React's state, is VERY important to first destructure original array and then create a NEW one.
    // Otherise React won't make the update and so, there will be no refresh in the table for that particular entry cell
    let tmp = [...users] 

    for (let idx in tmp) {
      if (tmp[idx].id === responseBody.id) {
        tmp[idx] = responseBody
        break // we found it, abort
      }
    }
    setUsers(tmp) // finally do the replacement using the new array of users
  }
}

 const onUserDeleted = (responseBody, errorStatus, errorMessage) => {
   userCount--

   if (errorStatus) {
     // a user failed to delete.
     // just update the error status
     if (userCount === 0) {
      setSelectedUserIds([])
      setRequestInProgress(false) // hide the spinner
     }
     setCurrentStatus('')
     setCurrentErrorStatus(errorStatus + ': ' + errorMessage)
     errorOnDelete = true
     return
   }

   console.log('User with id: ' + responseBody.id + ' was deleted from backend')
   
   // For simplicity, we wait until last deletion completes and then we do a refresh of all users
   // Of course, some deletions may fail, in which case user will see an error in red and then decide to manually refresh the table contents
   // to see which users have been actually deleted.
   if (userCount === 0) {
     if (errorOnDelete) {
       setCurrentStatus('Some delete operation(s) failed.')
     } else {
       setCurrentStatus('All selected users have been deleted from backend')
     }
    
    // clear whatever was marked as selected in the list
    setSelectedUserIds([])

    setRequestInProgress(false) // hide the spinner
  
    if (!errorOnDelete) {
     // Automatically trigger a fetch request to get all users bu tonly if no errors occured
     // This should refresh the table's contents showing the newly added entry.
     startFetchingAllUsers()
    }
   } else {
    setCurrentStatus('Users pending for deletion: ', userCount)
   }
 }

 const onUserCreated = (responseBody, errorStatus, errorMessage) => {
  if (errorStatus) {
    setCurrentStatus('') // clear the message which shows a pending activity
    setCurrentErrorStatus(errorStatus + ': ' + errorMessage)
    // we choose not to refresh user list if we get an error. let user manually refresh
    return
  }

  // Note that the responseBody is the newly created user, as returned by the backend.
  // This user object contains ALL the fields (not just the ones we filled in in our form,
  // but the complete object that backend created & commited in its database)
  console.log('User was created on the backend. response body: ', responseBody)

  // Automatically trigger a fetch request to get all users
  // This should refresh the table's contents showing the newly added entry.
  startFetchingAllUsers()
}

const onUserUpdated = (responseBody, errorStatus, errorMessage) => {
  if (errorStatus) {
    setCurrentStatus('') // clear the message which shows a pending activity
    setCurrentErrorStatus(errorStatus + ': ' + errorMessage)
    // we choose not to refresh user list if we get an error. let user manually refresh
    return
  }

  // Note that the responseBody is the newly created user, as returned by the backend.
  // This user object contains ALL the fields (not just the ones we filled in in our form,
  // but the complete object that backend created & commited in its database)
  // We COULD update our local table contents with this one, but an alternative is to fetch from backend for a refresh ..
  console.log('User was updated on the backend. response body: ', responseBody)

  setCurrentErrorStatus('') // if there was a previous error, wipe it because we now try again
  setCurrentStatus('User has been modified')

  // TODO: Instead of fetching all users and thus wasting network bandwidth,
  //       we could just fetch the user record we just modified. This way we exercise the GET by userID REST API.
  getExistingUser(responseBody.id, onUserFetched)
}

 /**
  * Triggers the fetching of all users
  */
 const startFetchingAllUsers = () => {
   // Before fetching all users, if details was shown for one (or form was displayed for new user), cancel it.
   cancelSelectedUserDetails()

   setRequestInProgress(true) // this is deemed to be a more time consuming operation, so show spinner
   setCurrentErrorStatus('') // if there was a previous error, wipe it because we now try again
   setCurrentStatus('Fetching all users ...')
   getExistingUsers(onAllUsersFetched)
 }

 const deleteUsers = () => {
   console.log('Deleting selected user(s) ...')
   // The REST API only supports deleting one user at a time, 
   // so we need to send separate network requests (if more then one user was selected)

   userCount = selectedUserIds.length // start with an initial number of users that need to be deleted
   setCurrentStatus('Users pending for deletion ...')

   if (selectedUserIds.length > 1) {
     setRequestInProgress(true) // this is deemed to be a more time consuming operation, so show spinner
   }

   // Go in a loop & delete one by one, by sending multiple requests
   errorOnDelete = false // reset flag
   setCurrentErrorStatus('') // if there was a previous error, wipe it because we now try again
   selectedUserIds.forEach( userId => deleteUser(userId, onUserDeleted))
 }

 const getAllUsersLabel = users.length > 0 ? 'Refresh User List' : 'Get Existing Users'
 // TODO: Place the CircularProgress as absolute position, so that is dsiplayed above all content
  return (
    <div className='App'>
      <h1>Manage JumpCloud Users (Demo)</h1>
      <Grid container className={classes.buttonContainer}>
        <Grid item className={classes.button}>
          <Button 
            variant="contained"
            color="primary"
            onClick={startFetchingAllUsers}>
              {getAllUsersLabel}
          </Button>
        </Grid>
        <Grid item className={classes.button}>
          <Button  
            variant="contained"
            color="primary"
            onClick={onCreatingNewUser}>
              Create a new user
          </Button>
        </Grid>
        <Grid item className={classes.button}>
          <Button  
            variant="contained"
            color="primary"
            disabled={selectedUserIds.length === 0}
            onClick={deleteUsers}>
              Delete user(s)
          </Button>
        </Grid>
      </Grid>
      { requestInProgress && <CircularProgress className={classes.spinner}/>}
      <Grid container className={classes.mainContentContainer}>
        <Grid item className={classes.table}>
          {users.length > 0 &&
          <CustomDataGrid 
            rows={users}
            onRowSelected={(user, checked) => onUserSelected(user, checked)}
            onDetailsSelected={user => onUserDetailsSelected(user)}
          />
          }
        </Grid>
        <Grid item>
        {
          showSelectedUserDetails &&
          <Paper elevation={8}>
            <UserDetailsCard
              user={selectedUserDetails}
              onUserSave={(user, isNewUser) => saveUser(user, isNewUser)}
              onUserCancel={cancelSelectedUserDetails}
            />
          </Paper>
        }
        </Grid>
      </Grid>

      <div style={{paddingTop: 20}}>
        <Typography variant='h6'>
          {currentStatus}
        </Typography>
      </div>

      <div style={{paddingTop: 50}}>
        <Typography variant='h6' color='error'>
          {currentErrorStatus}
        </Typography>
      </div>
    </div>
  )
}

export default App
