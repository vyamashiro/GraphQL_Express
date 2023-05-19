import * as dotenv from 'dotenv';
dotenv.config()

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import cors from 'cors';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';

// const endpointSecret = process.env.ENDPOINT_SECRET;

import { resolvers } from "./src/resolvers/resolvers.js";
import { typeDefs } from "./src/typeDefs/typeDefs.js";

const app = express();

const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  '/',
  cors(),
  bodyParser.json(),
  expressMiddleware(server, {
    // context: async ({ req }) => ({ token: req.headers.token }),
    // context: async ({ req }) => { console.log("endpoint 1", req) }
  }),
);

// app.post(
//   '/webhook', 
//   express.raw({type: 'application/json'}), 
//   cors(),
//   bodyParser.json(),
//   expressMiddleware(server, {
//     context: async ({ request, response }) => {

//       console.log('okokokoko');

//       let event = request.body;
//       // Only verify the event if you have an endpoint secret defined.
//       // Otherwise use the basic event deserialized with JSON.parse
//       if (endpointSecret) {
//         // Get the signature sent by Stripe
//         const signature = request.headers['stripe-signature'];
//         try {
//           event = stripe.webhooks.constructEvent(
//             request.body,
//             signature,
//             endpointSecret
//           );
//         } catch (err) {
//           console.log(`⚠️  Webhook signature verification failed.`, err.message);
//           return response.sendStatus(400);
//         }
//       }
      
//       console.log('type', event.type); 
//       // console.log('data', event.data); 
//       // console.log('metadata', event.data.object.metadata);
    
//       // Handle the event  
//       switch (event.type) {
//         case 'checkout.session.completed':
//           console.log('data', event.data.object);
//           console.log('payment_status', event.data.object.payment_status);
//           console.log('status', event.data.object.status); 
//           console.log('metadata', event.data.object.metadata);
//         case 'payment_intent.succeeded':
//           const paymentIntent = event.data.object;
//           console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
//           // Then define and call a method to handle the successful payment intent.
//           // handlePaymentIntentSucceeded(paymentIntent);
//           break;
//         case 'payment_method.attached':
//           const paymentMethod = event.data.object;
//           // Then define and call a method to handle the successful attachment of a PaymentMethod.
//           // handlePaymentMethodAttached(paymentMethod);
//           break;
//         default:
//           // Unexpected event type
//           console.log(`Unhandled event type ${event.type}.`);
//       }
    
//       // Return a 200 response to acknowledge receipt of the event
//       response.send();
//     },
//   }),
// );

await new Promise((resolve) => httpServer.listen({ port: 4242 }, resolve));

// const { url } = await startStandaloneServer(server, {
//   listen: { port: 4242 },
// });

console.log(`🚀 Server ready at http://localhost:4242/`);
