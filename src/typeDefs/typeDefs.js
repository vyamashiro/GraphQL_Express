export const typeDefs = `
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }

  type URLPayment {
    url: String
  }

  input CreatePaymentOrderInput {
    userId: String,
    userCompanyName: String,
  }

  type Mutation {
    createPaymentOrder(input: CreatePaymentOrderInput): URLPayment
  }

`;