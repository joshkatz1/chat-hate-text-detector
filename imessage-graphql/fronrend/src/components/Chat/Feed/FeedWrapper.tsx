import { Session } from "next-auth";
import { useRouter } from "next/router";
import { Flex } from "@chakra-ui/react";
import MessagesHeader from "./Messages/Header";
import MessageInputProps from "./Messages/Input";
import MessageInput from "./Messages/Input";
import Messages from "./Messages/Messages";
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
      border="1px solid green"
    >
      {conversationId && typeof conversationId === "string" ? (
        <>
          <Flex
            direction="column"
            justify="space-between"
            overflow="hidden"
            flexGrow={1}
            border="1px solid red"
          >
            <MessagesHeader conversationId={conversationId} userId={userId} />
            <Messages userId={userId} conversationId={conversationId} />
          </Flex>
          <MessageInput session={session} conversationId={conversationId} />
        </>
      ) : (
        <div> no conversation selected</div>
      )}
    </Flex>
  );
};
export default FeedWrapper;
