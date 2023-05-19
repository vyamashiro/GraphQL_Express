import * as dotenv from 'dotenv';
dotenv.config()

import Stripe from 'stripe';
const stripe = new Stripe(process.env.API_SECRET_STRIPE);

const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

export const resolvers = {
  Query: {
    books: () => books,
  },
  Mutation: {
    async createPaymentOrder(_, { input }) {
      const { userId, userCompanyName } = input;
      
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of   the product you want to sell
            price: process.env.PRICE_ID_ONE_YEAR,
            quantity: 1,
          },
        ],
        metadata: {
          // With metadata we can input custom information like user id.
          userId: userId,
          userCompanyName: userCompanyName,
        },
        mode: 'payment', // only payment (the product must have this configuration on Stripe platform).
        // mode: 'subscription', // for recurrent payment (the product must have this configuration on Stripe platform).
        success_url: `${process.env.YOUR_DOMAIN}/success`,
        cancel_url: `${process.env.YOUR_DOMAIN}/canceled`,
        automatic_tax: {enabled: true},
      })

      return {
        url: session.url
      }
    }
  }
};