exports.handler = function(event, context, callback) {

  /* CORS - for local testing - but better to use Netlify Dev
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type"
  }
  */

  if (event.httpMethod !== "Post") {
    return callback(null, {
      statusCode: 200,
      //headers,
      body: "This was not a POST request"
    });
  }

  const secretContent = `
  <h3>Welcome to the Secret Area</h3>
  <p>Here we can tell you that the sky is <strong>blue</strong>, and two plus two equals <strong>four</strong>.</p>
  `

  let body;

  if (event.body) {
    body = JSON.parse(event.body);
  } else {
    body = {};
  }

  if (body.password == 1234) {
    callback(null, {
      statusCode: 200,
      // headers,
      body: secretContent
    });
  } else {
    callback(null, {
      statusCode: 401
      // headers
    });
  }

};
