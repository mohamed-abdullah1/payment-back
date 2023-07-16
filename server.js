import express from "express";
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => console.log(`Server listening on port_ ${port}!`));
app.get("/", (req, res) => res.send("Hello World!"));

//requirements
//==> "POST Request" {userId,deviceToken}

//🔥🔥 setup push notification logic
// import { Expo } from "expo-server-sdk";
// // Create a new Expo SDK client
// // optionally providing an access token if you have enabled push security
// let expo = new Expo({});

// // Create the messages that you want to send to clients
// let messages = [];

// //🔥 here you will fetch the token from db and start sending notification to all users
// let somePushTokens = [
//   "ExponentPushToken[ScAanXJN91RWbTTl7g9rh2]",
//   "ExponentPushToken[UBN3nsJz0_QBoFjoxqCoyR]",
// ];
// for (let pushToken of somePushTokens) {
//   // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

//   // Check that all your push tokens appear to be valid Expo push tokens
//   if (!Expo.isExpoPushToken(pushToken)) {
//     console.error(`Push token ${pushToken} is not a valid Expo push token`);
//     continue;
//   }

//   // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
//   //🔥🔥 here is the function that you will call to send notification
//   messages.push({
//     to: pushToken,
//     sound: "default",
//     body: "This is a test notification",
//     ttl: 2, //🔥🔥 second of display the notification
//     data: { startTime: "10:00 pm" }, //🔥🔥 payload to pass in the notification
//   });
// }

// // The Expo push notification service accepts batches of notifications so
// // that you don't need to send 1000 requests to send 1000 notifications. We
// // recommend you batch your notifications to reduce the number of requests
// // and to compress them (notifications with similar content will get
// // compressed).
// let chunks = expo.chunkPushNotifications(messages);
// let tickets = [];
// (async () => {
//   // Send the chunks to the Expo push notification service. There are
//   // different strategies you could use. A simple one is to send one chunk at a
//   // time, which nicely spreads the load out over time:
//   for (let chunk of chunks) {
//     try {
//       let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//       console.log(ticketChunk);
//       tickets.push(...ticketChunk);
//       // NOTE: If a ticket contains an error code in ticket.details.error, you
//       // must handle it appropriately. The error codes are listed in the Expo
//       // documentation:
//       // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
//     } catch (error) {
//       console.error(error);
//     }
//   }
// })();

// // Later, after the Expo push notification service has delivered the
// // notifications to Apple or Google (usually quickly, but allow the the service
// // up to 30 minutes when under load), a "receipt" for each notification is
// // created. The receipts will be available for at least a day; stale receipts
// // are deleted.
// //
// // The ID of each receipt is sent back in the response "ticket" for each
// // notification. In summary, sending a notification produces a ticket, which
// // contains a receipt ID you later use to get the receipt.
// //
// // The receipts may contain error codes to which you must respond. In
// // particular, Apple or Google may block apps that continue to send
// // notifications to devices that have blocked notifications or have uninstalled
// // your app. Expo does not control this policy and sends back the feedback from
// // Apple and Google so you can handle it appropriately.
// let receiptIds = [];
// for (let ticket of tickets) {
//   // NOTE: Not all tickets have IDs; for example, tickets for notifications
//   // that could not be enqueued will have error information and no receipt ID.
//   if (ticket.id) {
//     receiptIds.push(ticket.id);
//   }
// }

// let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
// (async () => {
//   // Like sending notifications, there are different strategies you could use
//   // to retrieve batches of receipts from the Expo service.
//   for (let chunk of receiptIdChunks) {
//     try {
//       let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
//       console.log(receipts);

//       // The receipts specify whether Apple or Google successfully received the
//       // notification and information about an error, if one occurred.
//       for (let receiptId in receipts) {
//         let { status, message, details } = receipts[receiptId];
//         if (status === "ok") {
//           continue;
//         } else if (status === "error") {
//           console.error(
//             `There was an error sending a notification: ${message}`
//           );
//           if (details && details.error) {
//             // The error codes are listed in the Expo documentation:
//             // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
//             // You must handle the errors appropriately.
//             console.error(`The error code is ${details.error}`);
//           }
//         }
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   }
// })();

//stripe
const PUBLISH_KEY =
  "pk_test_51NTOtzEkiOlDBIPVXJBT4etIPOo1b6bl7b4vShSeRCVBrCAADxqUP2hDX44aZLvenj0ZpxZfcBSb1gUb6jROqDEA00javv5V8N";
const SECRET_KEY =
  "sk_test_51NTOtzEkiOlDBIPVf330LHyaOlZ2w4fPRU8vXgTKRPGYtCwVv6DKlszghREiFO6dm9V8tAktTiMktVnaabDgk85F00O0eEd2hf";

import Stripe from "stripe";

//Confirm the API version from your stripe dashboard
const stripe = Stripe(SECRET_KEY, { apiVersion: "2020-08-27" });

app.post("/create-payment-intent", async (req, res) => {
  const amount = req.body.amount;

  console.log(amount);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount ?? 2000, //lowest denomination of particular currency
      currency: "usd",
      payment_method_types: ["card"], //by default
    });

    const clientSecret = paymentIntent.client_secret;
    console.log("😡", paymentIntent);
    res.json({
      clientSecret: clientSecret,
    });
  } catch (e) {
    console.log(e.message);
    res.json({ error: e.message });
  }
});
