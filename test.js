const lambdaFunction = require('./lib/handler/hubspotGet'); // assuming your lambda function is in lambdaFunction.js

const getEvent = {
  httpMethod: 'GET',
};

// const postEvent = {
//   httpMethod: 'POST',
//   body: JSON.stringify({
//     firstname: 'Joh',
//     lastname: 'Do',
//     email: 'johndo@example.com',
//   }),
// };

lambdaFunction.handler(getEvent, null, (err, result) => {
  console.log(result);
});

// lambdaFunction.handler(postEvent, null, (err, result) => {
//   console.log(result);
// });