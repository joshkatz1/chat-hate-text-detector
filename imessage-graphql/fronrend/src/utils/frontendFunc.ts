import { Prisma } from '@prisma/client'
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
  export const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
    sender: {
      select: {
        id: true,
        username: true,
      },
    },
  });
  export type MessagePopulated = Prisma.MessageGetPayload<{
    include: typeof messagePopulated;
  }>;

export type ConversationPopulated = Prisma.ConversationGetPayload<{ include: typeof conversationPopulated }>
export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{ include: typeof participantPopulated }>