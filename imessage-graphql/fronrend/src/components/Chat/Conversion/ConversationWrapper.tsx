import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Box, Skeleton } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import ConversationOperations from "../../../graphql/operations/conversation";
import { ConversationsData, ConversationUpdatedData } from "../../../utils/types";
import { ConversationPopulated, ParticipantPopulated } from "../../../../../backend/src/utils/types";
import { useEffect } from "react";
import { useRouter } from "next/router";
import SkeletonLoader from "../../common/SkeletonLoader";
interface ConversationWrapperProps {
  session: Session;
}

const ConversationWrapper: React.FC<ConversationWrapperProps> = ({
  session,
}) => {
  const { user: { id: userId } } = session
  const router = useRouter();
  const { conversationId } = router.query;
  const {
    data: conversationsData,
    error: conversationsError,
    loading: conversationsLoading,
    subscribeToMore,
  } = useQuery<ConversationsData, null>(
    ConversationOperations.Queries.conversations
  );
  
  const [markConversationAsRead] = useMutation<{ markConversationAsRead: boolean }, { userId: string, conversationId: string | undefined }>(ConversationOperations.Mutations.markConversationAsRead)
  
  useSubscription<ConversationUpdatedData, null>(
    ConversationOperations.Subscriptions.conversationUpdated,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;
        console.log("data", data)

        if (!subscriptionData) return;

        const {
          conversationUpdated: {
            conversation: updatedConversation,
          },
        } = subscriptionData;

        const { id: updatedConversationId, latestMessage } =
          updatedConversation;


        if (!conversationsData) return;

const currentlyViewConversation = updatedConversation.id === conversationId;
        if (currentlyViewConversation) {
        onViewConversation(conversationId,false)
}
      }
    }
  )
    

  
  
  console.log("here is conversation data", conversationsData);

  const onViewConversation = async (
    conversationId: string | undefined,
    hasSeenLatestMessage: boolean | undefined
  ) => {
    router.push({ query: { conversationId } });
    if (hasSeenLatestMessage) return;

    try {
      await markConversationAsRead({
        variables: {
          userId,
          conversationId,
        },
        optimisticResponse: {
          markConversationAsRead: true,
        },
        update: (cache) => {
          /**
           * get conversationparticipants from the cache
           */
           const participantsFragment = cache.readFragment<{
            participants: Array<ParticipantPopulated>;
          }>({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment Participants on Conversation {
                participants {
                  user {
                    id
                    username
                  }
                  hasSeenLatestMessage
                }
              }
            `,
          });

          if (!participantsFragment) return;
      
          const participants = [...participantsFragment.participants]
          const userParticipantIdx = participants.findIndex((participant) => {
            participant.user.id === userId
          })
          if (userParticipantIdx === -1) return
          const userParticipant = participants[userParticipantIdx]

          /**
           * update participants to show latestMessage as read
           **/
          participants[userParticipantIdx] = {
            ...userParticipant,
            hasSeenLatestMessage: true,
          }
        /**
         * update cache
         */
          
         cache.writeFragment({
          id: `Conversation:${conversationId}`,
          fragment: gql`
            fragment UpdatedParticipants on Conversation {
              participants
            }
          `,
          data: {
            participants,
          },
        });
      },
    });
  } catch (error) {
    console.log("onViewConversation error", error);
  }
};

  const subscribeToNewConversations = () => {
    subscribeToMore({
      document: ConversationOperations.Subscriptions.conversationCreated,
      updateQuery: (
        prev,
        {
          subscriptionData,
        }: {
          subscriptionData: {
            data: { conversationCreated: ConversationPopulated };
          };
        }
      ) => {
        if (!subscriptionData.data) return prev;
        const newConversation = subscriptionData.data.conversationCreated;
        console.log("prev", prev);
        console.log("newConversation", newConversation);
        return Object.assign({}, prev, {
          conversations: [newConversation, ...prev.conversations],
        });
      },
    });
  };

  useEffect(() => {
    subscribeToNewConversations();
  }, []);

  return (
    <Box
      width={{ base: "100%", md: "400px" }}
      flexDirection="column"
      bg="whiteAlpha.50"
      py={6}
      gap={4}
      px={3}
      display={{ base: conversationId ? "none" : "flex", md: "flex" }}
    >
      {conversationsLoading ? (
        <SkeletonLoader count={7} height="80px" />
      ) : (
        <ConversationList
          session={session}
          conversations={conversationsData?.conversations || []}
          onViewConversation={onViewConversation}
        />
      )}
    </Box>
  );
};
export default ConversationWrapper;
