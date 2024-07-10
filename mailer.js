const nodemailer = require("nodemailer");

const sendAdvertisementNotificationEmail = (
     email,
     userName,
     advertisementDetails,
     advertisementLink,
) => {
     const transporter = nodemailer.createTransport({
          host: "smtp.office365.com",
          port: 587,
          secure: false,
          auth: {
               user: process.env.EMAIL,
               pass: process.env.PASSWORD,
          },
     });

     const subject = `New Advertisement Alert - Explore Now!`;
     const introMessage = `
  <p>Dear ${userName},</p>
  <p>We're thrilled to inform you about a new advertisement from one of our vendors. Don't miss out on the latest offers!</p>
  <p><strong>Advertisement Details:</strong></p>
  <ul>
       <li><strong>Product/Service:</strong> ${advertisementDetails.productService}</li>
       <li><strong>Description:</strong> ${advertisementDetails.description}</li>
  </ul>
  <p>Click the button below to explore the advertisement:</p>
  <a class="cta-button" href="${advertisementLink}">Explore Now</a>
  `;

     const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: subject,
          html: `
       <!DOCTYPE html>
       <html>
       <head>
            <style>
                 /* CSS styles for the email template */
                 @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
                 <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

                 body {
                      font-family: 'Montserrat', Arial, sans-serif;
                      line-height: 1.6;
                 }
                 .container {
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                      background-color: #f5f5f5;
                      border-radius: 5px;
                 }
                 .header {
                      text-align: center;
                      margin-bottom: 20px;
                 }
                 .message {
                      margin-bottom: 20px;
                      background-color: #ffffff;
                      padding: 20px;
                      border-radius: 5px;
                 }
                 .highlight {
                      font-weight: bold;
                 }
                 .footer {
                      margin-top: 20px;
                      text-align: center;
                      font-size: 12px;
                 }
                 .logo {
                      display: block;
                      margin: 0 auto;
                      max-width: 200px;
                 }
                 .cta-button {
                      display: inline-block;
                      margin-top: 20px;
                      padding: 10px 20px;
                      background-color: #007bff;
                      color: #ffffff;
                      text-decoration: none;
                      border-radius: 5px;
                 }
                 .cta-button:hover {
                      background-color: #0056b3;
                 }
            </style>
       </head>
       <body>
            <div class="container">
                 <div class="header">
                      <img class="logo" src="https://cdn.jsdelivr.net/gh/Richey24/imarket-cdn/src/assets/images/logo.png" alt="Company Logo">
                 </div>
                 <div class="message">
                      ${introMessage}
                 </div>
                 <div class="footer">
                      <p style="color: #777777;">This email was sent by [Your Company Name]. If you no longer wish to receive emails from us, please <a href="#" style="color: #777777; text-decoration: underline;">unsubscribe</a>.</p>
                 </div>
            </div>
       </body>
       </html>       
       `,
     };

     transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
               console.log(error);
          } else {
               console.log("Advertisement Notification Email sent: " + info.response);
          }
     });
};

const sendFailedOrderToAdmin = (
     id,
     site,
     payID,
) => {
     const transporter = nodemailer.createTransport({
          host: "smtp.office365.com",
          port: 587,
          secure: false,
          auth: {
               user: process.env.EMAIL,
               pass: process.env.PASSWORD,
          },
     });

     const subject = `Failed Order On ${site}`;
     const introMessage = `
  <p>An order with id ${id} sent to ${site} failed</p>
  <p>You can refund the user on stripe using the transaction ID - ${payID}</p>
  `;

     const mailOptions = {
          from: process.env.EMAIL,
          to: "info@ishop.black",
          subject: subject,
          html: `
       <!DOCTYPE html>
       <html>
       <head>
            <style>
                 /* CSS styles for the email template */
                 @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
                 <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

                 body {
                      font-family: 'Montserrat', Arial, sans-serif;
                      line-height: 1.6;
                 }
                 .container {
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                      background-color: #f5f5f5;
                      border-radius: 5px;
                 }
                 .header {
                      text-align: center;
                      margin-bottom: 20px;
                 }
                 .message {
                      margin-bottom: 20px;
                      background-color: #ffffff;
                      padding: 20px;
                      border-radius: 5px;
                 }
                 .highlight {
                      font-weight: bold;
                 }
                 .footer {
                      margin-top: 20px;
                      text-align: center;
                      font-size: 12px;
                 }
                 .logo {
                      display: block;
                      margin: 0 auto;
                      max-width: 200px;
                 }
                 .cta-button {
                      display: inline-block;
                      margin-top: 20px;
                      padding: 10px 20px;
                      background-color: #007bff;
                      color: #ffffff;
                      text-decoration: none;
                      border-radius: 5px;
                 }
                 .cta-button:hover {
                      background-color: #0056b3;
                 }
            </style>
       </head>
       <body>
            <div class="container">
                 <div class="header">
                      <img class="logo" src="https://cdn.jsdelivr.net/gh/Richey24/imarket-cdn/src/assets/images/logo.png" alt="Company Logo">
                 </div>
                 <div class="message">
                      ${introMessage}
                 </div>
                 <div class="footer">
                      <p style="color: #777777;">This email was sent by iMarketplace. If you no longer wish to receive emails from us, please <a href="#" style="color: #777777; text-decoration: underline;">unsubscribe</a>.</p>
                 </div>
            </div>
       </body>
       </html>       
       `,
     };

     transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
               console.log(error);
          } else {
               console.log("Failed Order sent to Admin: " + info.response);
          }
     });
};

const sendFailedOrderToUser = (
     id,
     email
) => {
     const transporter = nodemailer.createTransport({
          host: "smtp.office365.com",
          port: 587,
          secure: false,
          auth: {
               user: process.env.EMAIL,
               pass: process.env.PASSWORD,
          },
     });

     const subject = `Your Order Was Not Successfull`;
     const introMessage = `
  <p>Your order with id ${id} failed</p>
  <p>You will be refunded the exact amount</p>
  `;

     const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: subject,
          html: `
       <!DOCTYPE html>
       <html>
       <head>
            <style>
                 /* CSS styles for the email template */
                 @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
                 <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

                 body {
                      font-family: 'Montserrat', Arial, sans-serif;
                      line-height: 1.6;
                 }
                 .container {
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                      background-color: #f5f5f5;
                      border-radius: 5px;
                 }
                 .header {
                      text-align: center;
                      margin-bottom: 20px;
                 }
                 .message {
                      margin-bottom: 20px;
                      background-color: #ffffff;
                      padding: 20px;
                      border-radius: 5px;
                 }
                 .highlight {
                      font-weight: bold;
                 }
                 .footer {
                      margin-top: 20px;
                      text-align: center;
                      font-size: 12px;
                 }
                 .logo {
                      display: block;
                      margin: 0 auto;
                      max-width: 200px;
                 }
                 .cta-button {
                      display: inline-block;
                      margin-top: 20px;
                      padding: 10px 20px;
                      background-color: #007bff;
                      color: #ffffff;
                      text-decoration: none;
                      border-radius: 5px;
                 }
                 .cta-button:hover {
                      background-color: #0056b3;
                 }
            </style>
       </head>
       <body>
            <div class="container">
                 <div class="header">
                      <img class="logo" src="https://cdn.jsdelivr.net/gh/Richey24/imarket-cdn/src/assets/images/logo.png" alt="Company Logo">
                 </div>
                 <div class="message">
                      ${introMessage}
                 </div>
                 <div class="footer">
                      <p style="color: #777777;">This email was sent by iMarketplace. If you no longer wish to receive emails from us, please <a href="#" style="color: #777777; text-decoration: underline;">unsubscribe</a>.</p>
                 </div>
            </div>
       </body>
       </html>       
       `,
     };

     transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
               console.log(error);
          } else {
               console.log("Failed Order sent to Admin: " + info.response);
          }
     });
};


const sendSubscriptionNotification = (
     userEmail,
     userName,
     domain,
     phone
) => {
     const transporter = nodemailer.createTransport({
          host: "smtp.office365.com",
          port: 587,
          secure: false,
          auth: {
               user: process.env.EMAIL,
               pass: process.env.PASSWORD,
          },
     });

     const subject = "New Subscriber Notification";

     const mailOptions = {
          from: process.env.EMAIL,
          to: "info@ishop.black",
          subject: subject,
          html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');

          body {
            font-family: 'Montserrat', Arial, sans-serif;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
            border-radius: 5px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .message {
            margin-bottom: 20px;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
          }
          .highlight {
            font-weight: bold;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
          }
          .logo {
            display: block;
            margin: 0 auto;
            max-width: 200px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img class="logo" src="https://cdn.jsdelivr.net/gh/Richey24/imarket-cdn/src/assets/images/logo.png" alt="Company Logo">
            <h1 style="color: #333333;">New Paid Subscriber</h1>
          </div>
          <div class="message">
            <p>Hey I.B,</p>
            <p>A new user has subscribed with the following details:</p>
            <ul>
              <li><span class="highlight">Email:</span> ${userEmail}</li>
              <li><span class="highlight">Name:</span> ${userName}</li>
              <li><span class="highlight">Domain:</span> ${domain}</li>
              <li><span class="highlight">Phone:</span> ${phone}</li>
            </ul>
            <p>Please reach out to the new subscriber to welcome them and offer any assistance they may need.</p>
          </div>
          <div class="footer">
            <p style="color: #777777;">This email was sent by IMarketplace, LLC.</p>
          </div>
        </div>
      </body>
      </html>       
    `,
     };

     transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
               console.log(error);
          } else {
               console.log("sub Email sent: " + info.response);
               // do something useful
          }
     });
};


module.exports = {
     sendAdvertisementNotificationEmail,
     sendFailedOrderToAdmin,
     sendFailedOrderToUser,
     sendSubscriptionNotification
}