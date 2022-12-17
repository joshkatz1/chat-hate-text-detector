import { useQuery } from "@apollo/client";
import { Flex, Stack } from "@chakra-ui/react";
import {
  MessagesData,
  MessagesSubscriptionData,
  MessagesVariables,
} from "../../../../utils/types";
import MessageOperation from "../../../../graphql/operations/message";
import toast from "react-hot-toast";
import SkeletonLoader from "../../../common/SkeletonLoader";
import { useEffect } from "react";
import MessageItem from "./MessageItem";

interface MessagesProps {
  userId: string;
  conversationId: string;
}

const Messages: React.FC<MessagesProps> = ({ userId, conversationId }) => {
  const { data, loading, error, subscribeToMore } = useQuery<
    MessagesData,
    MessagesVariables
  >(MessageOperation.Query.messages, {
    variables: {
      conversationId,
    },
    onError: ({ message }) => {
      toast.error(message);
    },
  });


  const subscribeToMoreMessages = (conversationId: string) => {
    return subscribeToMore({
      document: MessageOperation.Subscriptions.messageSent,
      variables: {
        conversationId,
      },
      updateQuery: (prev, { subscriptionData }: MessagesSubscriptionData) => {
        if (!subscriptionData.data) return prev;

        const newMessage = subscriptionData.data.messageSent;
        return Object.assign({}, prev, {
          messages: newMessage.sender.id ===userId ? prev.messages : [newMessage, ...prev.messages],
        });
      },
    });
  };

  useEffect(() => {
    const unsubscribe = subscribeToMoreMessages(conversationId);

    return () => unsubscribe();
  }, [conversationId]);

  if (error) {
    return null;
  }
  return (
    <Flex direction="column" justify="flex-end" overflow="hidden">
      {loading && (
        <Stack spacing={4} px={4}>
          <SkeletonLoader count={4} height="60px" />
        </Stack>
      )}
      {data?.messages && (
        <Flex direction="column-reverse" overflow="scroll" height="100%">
          {data.messages.map((message) => (
            <MessageItem
              message={message}
              sentByMe={message.sender.id === userId}
            />
          ))}
        </Flex>
      )}
    </Flex>
  );
};
export default Messages;
