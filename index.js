import * as dotenv from 'dotenv';
dotenv.config()

import Stripe from 'stripe';
const stripe = new Stripe(process.env.API_SECRET_STRIPE);

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import cors from 'cors';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';

// const endpointSecret = process.env.ENDPOINT_SECRET;
const endpointSecret = 'whsec_3d268eef4d9d4b77a5687bf64363fda509327bfbab92b5c0b5eb45809b6e11db';

import { resolvers } from "./src/resolvers/resolvers.js";
import { typeDefs } from "./src/typeDefs/typeDefs.js";

const app = express();

const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  // context: ({ req }) => {
  //   // Coloque o middleware cors antes do expressMiddleware
  //   cors({
  //     origin: '*',
  //     preflightContinue: true,
  //   })(req, res, () => {});
  //   return {};
  // },
});

await server.start();


// Use JSON parser for all non-webhook routes
// app.use(
//   '/',
//   bodyParser.json(),
//   expressMiddleware(server, {
//     context: async (req, res, next) => {
//       if (req.originalUrl === '/webhook') {
//         next();
//       } else {
//         bodyParser.json()(req, res, next);
//       }

//     }})
// );

app.use(
  cors({
    origin: '*',
    credentials: true
  }),
);

app.post(
  '/',
  bodyParser.json(),
  expressMiddleware(server, {
    // context: async (req, res, next) => {
    //   if (req.originalUrl === '/webhook') {
    //     next();
    //   } else {
    //     bodyParser.json()(req, res, next);
    //   }
    // }
  })
);

app.use(
  '/webhook',
  // bodyParser.raw({type: 'application/json'}),
  // bodyParser.json(),
  (req, res) => {
    return res.json({ received: true });
  }
);

app.post(
  '/webhook',
  // cors({ origin: '*' }),
  // cors(),
  // cors({ origin: ['http://localhost:3000/', 'https://localhost:3000/'] }),
  // express.raw({type: 'application/json'}),
  // bodyParser.json(),
  bodyParser.raw({type: 'application/json'}),
  expressMiddleware(server, {
    context: async ({ req, res }) => {

      console.log('webhook');

      // console.log('req', req);
      // console.log('res', res);

      let event = req.body;
      // console.log('event', event);

      // Only verify the event if you have an endpoint secret defined.
      // Otherwise use the basic event deserialized with JSON.parse
      if (endpointSecret) {
        // Get the signature sent by Stripe
        const signature = req.headers['stripe-signature'];
        try {
          event = await stripe.webhooks.constructEvent(
            req.body,
            signature,
            endpointSecret
          );
        } catch (err) {
          console.log(`⚠️  Webhook signature verification failed.`, err.message);
          return res.sendStatus(400);
          // return res.status(400).send(`Webhook Error: ${err.message}`);
        }
      }
  
      // console.log('type', event.type); 
      // console.log('data', event.data); 
      // console.log('metadata', event.data.object.metadata);
    
      // Handle the event  
      switch (event.type) {
        case 'checkout.session.completed':
          // console.log('payment_status', event.data.object.payment_status);
          // console.log('status', event.data.object.status); 
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
          // console.log('data', event.data.object);
          // console.log('metadata', event.data.object.metadata);

        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
          break;
        case 'payment_method.attached':
          const paymentMethod = event.data.object;
          // Then define and call a method to handle the successful attachment of a PaymentMethod.
          // handlePaymentMethodAttached(paymentMethod);
          break;
        default:
          // Unexpected event type
          console.log(`Unhandled event type ${event.type}.`);
      }
    
      // Return a 200 res to acknowledge receipt of the event
      
      console.log('Operação concluída !!!!');

      // res.json({received: true});
      // res.json({received: true});
      // return res.send();
    },
  }),
);

await new Promise((resolve) => httpServer.listen({ port: 4242 }, resolve));

console.log(`🚀 Server ready at http://localhost:4242/`);
