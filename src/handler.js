// MailChimp environment variables
var MANDRILL_API_KEY = process.env.MANDRILL_API_KEY,
  MANDRILL_FROM_EMAIL = process.env.MANDRILL_FROM_EMAIL,
  MANDRILL_FROM_NAME = process.env.MANDRILL_FROM_NAME,
  MANDRILL_TEMPLATE_NAME = process.env.MANDRILL_TEMPLATE_NAME;

var Mailchimp = require("mailchimp-api-v3");
var md5 = require("md5");
var mandrill = require("mandrill-api/mandrill");
var mandrill_client = new mandrill.Mandrill(MANDRILL_API_KEY);

var request = require("request"),
  throttledRequest = require("throttled-request")(request);

throttledRequest.configure({
  requests: 5,
  milliseconds: 1200,
});

// Require the AWS SDK and get the instance of our DynamoDB
var AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

// send user email welcome template
function sendTemplate(email) {
  console.log(
    "5.0 Mandrill sendTemplate - ",
    MANDRILL_API_KEY,
    MANDRILL_TEMPLATE_NAME,
    MANDRILL_FROM_EMAIL,
    MANDRILL_FROM_NAME
  );
  var template_name = MANDRILL_TEMPLATE_NAME;
  var template_content = [
    {
      name: "mandrillcontent",
      content: "test content",
    },
  ];
  var message = {
    //"html": "<p>Example HTML content</p>",
    //"text": "Example text content",
    //"subject": "example subject",
    from_email: MANDRILL_FROM_EMAIL,
    from_name: MANDRILL_FROM_NAME,
    to: [
      {
        email: email,
        name: email,
        type: "to",
      },
    ],
    headers: {
      "Reply-To": MANDRILL_FROM_EMAIL,
    },
    important: false,
    track_opens: null,
    track_clicks: null,
    auto_text: null,
    auto_html: null,
    inline_css: null,
    url_strip_qs: null,
    preserve_recipients: null,
    view_content_link: null,
    tracking_domain: null,
    signing_domain: null,
    return_path_domain: null,
    merge: true,
    merge_language: "mailchimp",
  };
  var async = false;
  var ip_pool = "Main Pool";
  var send_at = "example send_at";
  mandrill_client.messages.sendTemplate(
    {
      template_name: template_name,
      template_content: template_content,
      message: message,
      async: async,
      ip_pool: ip_pool,
    },
    function (result) {
      console.log("5.1 - ", result);
      /*
        [{
                "email": "recipient.email@example.com",
                "status": "sent",
                "reject_reason": "hard-bounce",
                "_id": "abc123abc123abc123abc123abc123"
            }]
        */
    },
    function (e) {
      // Mandrill returns the error as an object with name and message keys
      console.log(
        "5.2 - A mandrill error occurred: " + e.name + " - " + e.message,
        e
      );
      // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    }
  );
}

// This will be the function called when our Lambda function is exectued
exports.mandrillHandler = async (event, context, callback) => {
  const requestId = context.awsRequestId;
  console.log("1.1 - ", event);
  //   var email = event.email.toLowerCase();
  var email = "johnktransue@gmail.com";
  sendTemplate(email);
    // Handle promise fulfilled/rejected states
    await createEmail(requestId, event).then(() => {
      callback(null, {
          statusCode: 201,
          body: '',
          headers: {
              'Access-Control-Allow-Origin' : '*'
          }
      });
  }).catch((err) => {
      console.error(err)
  })
  //var phone = event.phone.toLowerCase();
//   var field_email_source = event.field_email_source;
//   var field_email_source_form_input = event.field_email_source_form_input;

  // We'll use the same response we used in our Webtask
  const RESPONSE = {
    OK: {
      statusCode: 200,
      message: "You have successfully subscribed to the newsletter!",
    },
    DUPLICATE: {
      status: 400,
      message: "You are already subscribed.",
    },
    ERROR: {
      status: 400,
      message: "Something went wrong. Please try again.",
    },
  };

  // Capture the email from our POST request
  // For now, we'll just set a fake email
  //var email = event.body.email;

  if (!email) {
    // If we don't get an email, we'll end our execution and send an error
    return callback(null, RESPONSE.ERROR);
  }

  // If we do have an email, we'll set it to our model
  // Insert the email into the database
  // Function createEmail
// Writes message to DynamoDb table Message 
function createEmail(requestId, event) {

  const ddbPutParams = {
    TableName: 'PPSubscribers',
    Item: {
      'emailId' : requestId,
      'email' : 'johnktransue@gmail.com',
      'timestamp': {S: new Date().toISOString()} 
    },
  };
  return ddb.put(ddbPutParams).promise();
}

  // search if record exists in Tradable Bits
  console.log("1.7 - searchRecord() - ");

  var emailURIEncode = encodeURIComponent(email);

  console.log("1.71 - emailURIEncode - ", emailURIEncode);

  console.log("2.6 - call mailchimp addToList: ", email);
  //addToMCList(email);
  console.log("5.3 - END", email);
};
