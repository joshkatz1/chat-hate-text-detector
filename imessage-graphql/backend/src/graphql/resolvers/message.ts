import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
import {
  GraphQLContext,
  MessagePopulated,
  ParticipantPopulated,
  SendMessageArguments,
  SendMessageSubscriptionPayload,
} from "../../utils/types";
import { userIsConversationParticipant } from "../../utils/functions";
import { conversationPopulated } from "./conversation";

const resolvers = {
  Query: {
    messages: async (
      _: any,
      args: { conversationId: string },
      context: GraphQLContext
    ): Promise<Array<MessagePopulated>> => {
      const { session, prisma } = context;
      const { conversationId } = args;
      if (!session?.user) {
        throw new GraphQLError("not autherized");
      }
      const {
        user: { id: userId },
      } = session;
      /**
       * verift that user is participant
       */
      const conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: conversationPopulated,
      });
      if (!conversation) {
        throw new GraphQLError("conversaation does not exist");
      }
      const allowedToView = userIsConversationParticipant(
        conversation.participants,
        userId
      );
      if (!allowedToView) {
        throw new Error("not authorized");
      }
      try {
        const messages = await prisma.message.findMany({
          where: {
            conversationId,
          },
          include: messagePopulated,
          orderBy: {
            createdAt: "desc",
          },
        });
        return messages
      } catch (error: any) {
        console.log("messages error", error);
        throw new GraphQLError("error");
      }
    },
  },
  Mutation: {
    sendMessage: async (
      _: any,
      args: SendMessageArguments,
      context: GraphQLContext
    ): Promise<boolean> => {
      const { session, prisma, pubsub } = context;

      const { id: messageId, body, senderId, conversationId } = args;

      if (!session?.user) {
        throw new GraphQLError("not authorized");
      }
      const { id: userId } = session.user;

      if (userId !== senderId) {
        throw new GraphQLError("not authorized");
      }
      try {
        /**
         * create new message entity
         */
        const newMessage = await prisma.message.create({
          data: {
            id: messageId,
            senderId,
            conversationId,
            body,
          },
          include: messagePopulated,
        });
        const participant = await prisma.conversationParticipant.findFirst({
          where: {
            userId,
            conversationId,
          },
        });

        /**
         * Should always exist
         */
        if (!participant) {
          throw new GraphQLError("Participant does not exist");
        }

        const { id: participantId } = participant;

        /**
         * update conversation entity
         */
        const conversation = await prisma.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            latestMessageId: newMessage.id,
            participants: {
              update: {
                where: {
                  id: participantId,
                },
                data: {
                  hasSeenLatestMessage: true,
                },
              },
              updateMany: {
                where: {
                  NOT: {
                    userId,
                  },
                },
                data: {
                  hasSeenLatestMessage: false,
                },
              },
            },
          },
          include: conversationPopulated,
        });
        pubsub.publish("MESSAGE_SENT", { messageSent: newMessage });
        // pubsub.publish("conversation update", {
        //   conversationUpdate: conversation,
        // });
      } catch (error) {
        console.log("sendMessage error", error);
        throw new GraphQLError("error sending message");
      }

      return true;
    },
  },
  Subscription: {
    messageSent: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;

          return pubsub.asyncIterator(["MESSAGE_SENT"]);
        },
        (
          payload: SendMessageSubscriptionPayload,
          args: { conversationId: string },
          context: GraphQLContext
        ) => {
          return payload.messageSent.conversationId === args.conversationId;
        }
      ),
    },
  },
};

export const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
  sender: {
    select: {
      id: true,
      username: true,
    },
  },
});

export default resolvers;
