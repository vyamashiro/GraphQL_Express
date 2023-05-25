export const typeDefs = `
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