
import gql from "graphql-tag";
const typeDefs = gql`
scalar Date
  type Mutation {
    createConversation(participantIds: [String]): CreateConversationResponse
    markConversationAsRead(userId: String!, conversationId: String!):Boolean
  }

  type CreateConversationResponse {
    conversationId: String
  }
  type conversationUpdatedSubscriptionPayload {
    conversationId: String
  }

  type Conversation{
    id: String
    latestMessage: Message
    participants: [Participant]
    createdAt: Date
    updatedAt: Date
  }

  type Participant{
    id: String
    user: User
    hasSeenLatestMessage: Boolean 
  }

  type Query {
    conversations: [Conversation]
  }

  type Subscription {
    conversationCreated: Conversation
  }
  type Subscription {
    conversationUpdated: conversationUpdatedSubscriptionPayload
  }

`;

export default typeDefs;
