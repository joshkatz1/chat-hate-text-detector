import { Session } from "next-auth";
import { useRouter } from "next/router";
import { Flex } from "@chakra-ui/react";
import MessagesHeader from "./Messages/Header";
import MessageInputProps from "./Messages/Input";
import MessageInput from "./Messages/Input";
import Messages from "./Messages/Messages";
import NoConversationSelected from "./NoConversationSelected";
interface FeedWrapperProps {
  session: Session;
}

const FeedWrapper: React.FC<FeedWrapperProps> = ({ session }) => {
  const router = useRouter();
  const { conversationId } = router.query;
  const {
    user: { id: userId },
  } = session;
  return (
    <Flex
      display={{ base: conversationId ? "flex" : "none", md: "flex" }}
      direction="column"
      width="100%"
    >
      {conversationId && typeof conversationId === "string" ? (
        <>
          <Flex
            direction="column"
            justify="space-between"
            overflow="hidden"
            flexGrow={1}
          >
            <MessagesHeader conversationId={conversationId} userId={userId} />
            <Messages userId={userId} conversationId={conversationId} />
          </Flex>
          <MessageInput session={session} conversationId={conversationId} />
        </>
      ) : (
        <NoConversationSelected />
      )}
    </Flex>
  );
};
export default FeedWrapper;
