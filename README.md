# SaveBlue-Backend
Backend service for the SaveBlue App.


## Installation
- Install Node.js, npm and MongoDB
- Navigate to `/src` directory
- Install dependencies with `npm install`
- Run the server with `npm start` or optionally: `npm install -g nodemon` and `nodemon` to continuously run the server

## Testing
- Run tests with `npm test`
- jest.global-setup is used to start the server and populate the db before running tests
- jest.global-teardown is used to stop the server after running tests. Db is not deleted after tests but at the start of testing.
- test_entries.js stores the mock data used for testing
- Jest tests are run in parallel where each test affects the db, so they need to be written in a way to not interfere with each other. We need to create a new file with test ids as each test suite is run in a separate environment, we can't use global variables to store data between tests. 