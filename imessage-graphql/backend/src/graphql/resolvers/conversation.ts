import { Conversation, Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import { ConversationUpdatedSubscriptionPayload, ConversationPopulated, GraphQLContext, ConversationDeletedSubscriptionPayload } from "./../../utils/types";
import { withFilter } from "graphql-subscriptions";
import { userIsConversationParticipant } from "../../utils/functions";

const resolvers = {
  Query: {
    conversations: async (
      _: any,
      __: any,
      context: GraphQLContext
    ): Promise<Array<ConversationPopulated>> => {
      const { session, prisma } = context;

      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }

      try {
        const { id } = session.user;
        /**
         * Find all conversations that user is part of
         */
        const conversations = await prisma.conversation.findMany({
          /**
           * Below has been confirmed to be the correct
           * query by the Prisma team. Has been confirmed
           * that there is an issue on their end
           * Issue seems specific to Mongo
           */
          // where: {
          //   participants: {
          //     some: {
          //       userId: {
          //         equals: id,
          //       },
          //     },
          //   },
          // },
          include: conversationPopulated,
        });

        /**
         * Since above query does not work
         */
        return conversations.filter(
          (conversation) =>
            !!conversation.participants.find((p) => p.userId === id)
        );
      } catch (error: any) {
        console.log("error", error);
        throw new GraphQLError(error?.message);
      }
    },
  },

  Mutation: {
    createConversation: async (
      _: any,
      args: { participantIds: Array<string> },
      context: GraphQLContext
    ): Promise<{ conversationId: string }> => {
      const { session, prisma, pubsub } = context;
      const { participantIds } = args;
      if (!session?.user) {
        throw new GraphQLError("not autherized ");
      }
      const {
        user: { id: userId },
      } = session;
      try {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: participantIds.map((id) => ({
                  userId: id,
                  hasSeenLatestMessage: id === userId,
                })),
              },
            },
          },
          include: conversationPopulated,
        });

        pubsub.publish("CONVERSATION_CREATED", {
          conversationCreated: conversation,
        });

        return {
          conversationId: conversation.id,
        };
      } catch (error) {
        console.log("createConversation error: " + error);
        throw new GraphQLError("error createConversation");
      }
    },
    markConversationAsRead: async function (_: any, args: { userId: string, conversationId: string }, context: GraphQLContext): Promise<boolean> {
      const { session, prisma } = context;
      const { userId, conversationId } = args;
      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }
      try {
        const participant = await prisma.conversationParticipant.findFirst({
          where: {
            conversationId,
            userId,
          }
        })
          ;

        if (!participant) {
          throw new GraphQLError("participants entity not found")
        }
        await prisma.conversationParticipant.update({
          where: {
            id: participant.id,
          },
          data: {
            hasSeenLatestMessage: true,
          }
        })
        return true 
      } catch (error: any) {
        console.log("markconversationasread error", error)
        throw new GraphQLError(error.message);
      
      }
     
    },
    deleteConversation: async function (_: any, args: { conversationId: string }, context: GraphQLContext): Promise<boolean> {
      const { session, prisma,pubsub } = context;
      const { conversationId } = args
      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }
      try {
        const [deletedConversation] = await prisma.$transaction([
          prisma.conversation.delete({
            where: {
              id: conversationId,
            },
            include: conversationPopulated,
          }),
          prisma.conversationParticipant.deleteMany({
            where: {
              conversationId,

            
            }
          }),
          prisma.message.deleteMany({
            where: {
              conversationId,
            }
          })

        ]);
        pubsub.publish("CONVERSATION_DELETED", {
          conversationDeleted: deletedConversation,
        });

        
      } catch (error:any) {
        console.log("markconversation error", error)
        throw new GraphQLError(error.message);
      }

      return true;
    }
  },
  Subscription: {
    conversationCreated: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
        },
        (
          payload: ConversationCreatedSubscriptionPayload,
          _,
          context: GraphQLContext
        ) => {
          const { session } = context;
          const {
            conversationCreated: { participants },
          } = payload;
          const userIsParticipant = !!participants.find(
            (p) => p.userId === session?.user?.id
          );
          return userIsParticipant;
        }
      ),
    },
    
    conversationUpdated: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;

          return pubsub.asyncIterator(["CONVERSATION_UPDATED"]);
        },
        (
          payload: ConversationUpdatedSubscriptionPayload,
          _,
          context: GraphQLContext
        ) => {
          const { session } = context;
          if (!session?.user) {
            throw new GraphQLError("Not authorized");
          }

          const { id: userId } = session.user;
          console.log(payload)
          const {
            conversationUpdated: {
              conversation: { participants },
            },
          } = payload;

          const userIsParticipant = userIsConversationParticipant(
            participants,
            userId
          );

          const userSentLatestMessage =
            payload.conversationUpdated.conversation.latestMessage?.senderId ===
            userId;

          

          return (
            (userIsParticipant && !userSentLatestMessage) 
          );
        }
      ),
    },
    conversationDeleted: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_DELETED"])
        },
        (
          payload: ConversationDeletedSubscriptionPayload,
          _,
          context: GraphQLContext
        ) => {
          const { session } = context;
          if (!session?.user) {
            throw new GraphQLError("Not authorized");
          }
          const { id: userId } = session.user;
          const {
            conversationDeleted: { participants },
          } = payload;
          return userIsConversationParticipant(
            participants,
            userId);
        }
  
     ),
    },
  },
};

export interface ConversationCreatedSubscriptionPayload {
  conversationCreated: ConversationPopulated;
}

export const participantPopulated =
  Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
      select: {
        id: true,
        username: true,
      },
    },
  });

export const conversationPopulated =
  Prisma.validator<Prisma.ConversationInclude>()({
    participants: {
      include: participantPopulated,
    },
    latestMessage: {
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
  });

export default resolvers;
