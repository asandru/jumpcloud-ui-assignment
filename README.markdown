# JumpCloud UI Engineer Assignment

## Overview

To evaluate UI engineers, JumpCloud would like you to build a simple single page application
using your choice of a modern UI framework (e.g. Angular, React, Vue) that uses our public
API to implement standard [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete)
operations on users managed by a JumpCloud organization.

## Instructions

1. Go to https://www.jumpcloud.com, sign up for a free account, and activate it.
2. After signing in, navigate to the Users page and create a new user in the UI. The User Information
   section contains the only required fields which are indicated with an asterisk.
3. Notice that the new user is displayed in the Main Panel.
4. Click the row in the Main Panel and change the user's first name, last name, user name, or email
   address and click save. Notice the changes are displayed in the Main Panel.
5. Click the checkbox in the left column to select the user. Notice the Action Buttons in the
   upper right of the table are activated.
6. Click the delete button when the user is selected. Notice the user no longer appears in
   the Main Panel.

Congratulations! You have just explored the CRUD operations that can be performed from the JumpCloud
UI. But before you begin you'll set up just a few more things:

1. Click on your user name in the upper right and select API settings from the drop down.
   ![API Settings](api-settings-dropdown.png)
2. Copy your API key. You will be passing it to the server side application we've set up for you in this repo.
   ![API Key](api-key.png)
3. Clone this repo, run `npm install` to install all required packages, create a `.env` file with the key/value
   pair `API_KEY=YOUR_API_KEY` and then run `npm start` to start the web server on port 8005.
4. The web server is a simple express based app that proxies requests from `http://localhost:8005/api` to
   `https://console.jumpcloud.com/api` so that you can build a simple single page CRUD application
   using our [system users API](https://docs.jumpcloud.com/1.0/systemusers).
5. You will be using the following [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer)
   API requests:
   ```http
   GET /api/systemusers
   GET /api/systemusers/{id}
   POST /api/systemusers
   PUT /api/systemusers/{id}
   DELETE /api/systemusers/{id}
   ```
6. Go ahead and try it out using [`curl`](https://curl.haxx.se/) from the command line.
   ```shell
   curl -s -v 'http://localhost:8005/api/systemusers'
   ```
7. Now using the API we've provided, and your free account at [jumpcloud.com](http://www.jumpcloud.com),
   you're ready to build a simple single page application that allows CRUD operations on system users in
   your JumpCloud organization.

Let's move on to the requirements for this assignment.

## Requirements

In your GitHub account, create a new repo, and in that repo create a single page application that can do
the following:

1. List the users in your JumpCloud organization.
2. Create a new user.
3. Update an existing user.
4. Delete a user.
5. Be intuitive and have a clean user experience.

Feel free to use any modern application generator such as [Angular CLI](https://cli.angular.io/),
[Create React App](https://facebook.github.io/create-react-app/), [Vue CLI](https://cli.vuejs.org/), etc.
And feel free to use any modern CSS framework if you want to.

When you're done, please send us a link to your repo so we can clone it locally and test out
your UI.

We're excited to see what you build. And thanks for your interest in JumpCloud.
