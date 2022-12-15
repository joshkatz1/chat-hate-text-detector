import userResolvers from "./user";
import conversationResolver from "./conversation";
import MessageResolver from "./message";
import scalarResolvers from "./scalars";
import merge from "lodash.merge";

const resolvers = merge(
  {},
  userResolvers,
  conversationResolver,
  MessageResolver,
  scalarResolvers
);

export default resolvers;
