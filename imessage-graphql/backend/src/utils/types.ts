import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaClientOptions } from '@prisma/client/runtime';
import { ISODateString } from 'next-auth';
import { conversationPopulated, participantPopulated } from '../graphql/resolvers/conversation';
import { Context } from 'graphql-ws/lib/server'
import { PubSub } from 'graphql-subscriptions';
import { messagePopulated } from "../graphql/resolvers/message";


export interface GraphQLContext{
    session: Session | null
    prisma: PrismaClient
    pubsub: PubSub
}

export interface Session{
    user?: User | null
    expires: ISODateString

}

export interface SubscriptionContext extends Context{
    connectionParams: {
        session?:Session
    }
}

export interface User {
    id: string;
    username: string;
    image: string;
    emailVerified: boolean;
    name: string;
    email: string;
}
  
export interface CreateUserNameResponse{
    sucess?: boolean;
    error? : string;
}

// message
export interface SendMessageArguments {
    id: string;
    conversationId: string;
    senderId: string;
    body: string;
  }
  
  export interface SendMessageSubscriptionPayload {
    messageSent: MessagePopulated;
  }
  
  export type MessagePopulated = Prisma.MessageGetPayload<{
    include: typeof messagePopulated;
  }>;
export interface ConversationUpdatedSubscriptionPayload{
    conversationUpdated: {
      conversation: ConversationPopulated;
    };
  }

export type ConversationPopulated = Prisma.ConversationGetPayload<{include: typeof conversationPopulated}>

export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{ include: typeof participantPopulated }>

