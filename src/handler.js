// "use strict";

// module.exports.mandrillTest = async (event) => {
//   const randomNumber = parseInt(Math.random() * 100);
//   console.log("test");
//   console.log("the random generated integer is:", randomNumber);
//   return randomNumber;
// };


// const mailchimp = require('@mailchimp/mailchimp_transactional')('JdWn8RIkNJPZfoY-YZCnVg');

// async function callPing() {
//   const response = await mailchimp.users.ping();
//   console.log(response);
// }

// callPing();

// const mailchimpClient = require("@mailchimp/mailchimp_transactional")("JdWn8RIkNJPZfoY-YZCnVg");

// const run = async () => {
//   const response = await mailchimpClient.senders.list();
//   console.log(response);
// };

// run();
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
//AWS.config.update({region:'us-east-1'});
// function for subscribing a user to MailChimp
/*
function addToMCList(email) {
  console.log('2.9 - mailchimp', email);
  var emailmd5 = md5(email);
  console.log('2.91 - mailchimp emailmd5: ', emailmd5);
  
  var mailchimp = new Mailchimp(MC_API_KEY);
  mailchimp.request({
        //method : 'post',
        //path : '/lists/' + MC_LIST_ID + '/members',
        method: 'put',
        path: '/lists/' + MC_LIST_ID + '/members/' + emailmd5 ,
        body : {
          email_address : email,
          status : 'subscribed',
          merge_fields: {
            //
          }
        }
  }).then(function(results) {
      console.log('3.0 - mailchimp results: ');
  })
  .catch(function (err) {
      console.log('3.1 - mailchimp err: ', err);
  });
}
*/

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
exports.mandrillHandler = (event, context, callback) => {
  console.log("1.1 - ", event);
  //   var email = event.email.toLowerCase();
  var email = "johnktransue@gmail.com";
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

  //REMEMBER TO UPDATE DYNAMOB DB TABLE NAME
  // set Dynamo DB Table name
  // Insert the email into the database, but only if the email does not already exist.

  // search if record exists in Tradable Bits
  console.log("1.7 - searchRecord() - ");

  var emailURIEncode = encodeURIComponent(email);

  console.log("1.71 - emailURIEncode - ", emailURIEncode);

  console.log("2.6 - call mailchimp addToList: ", email);
  //addToMCList(email);
  console.log("5.3 - END", email);
};
