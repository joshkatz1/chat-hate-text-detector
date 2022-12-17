import { Flex, Box, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useState } from "react";
import { ConversationPopulated } from "../../../../../backend/src/utils/types";
import Modal from "../Modal";
import ConversationModal from '../Modal'
import ConversationItem from "./ConversationItem";
interface ConversationListProps {
  session: Session;
  conversations: Array<ConversationPopulated>;
  onViewConversation: (conversationId: string | undefined, hasSeenLatestMessage?: boolean | undefined)
    => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ session,conversations,onViewConversation }) => {
  
  const [isOpen, setIsOpen] = useState(false)

  
  
    const onOpen = () => { setIsOpen(true) }
    const onClose = () => { setIsOpen(false) }
    const router = useRouter()    
    const {user:{id:userId}} = session
  return (
    <Box width="100%" >
      <Box
        py={2}
        px={4}
        mb={4}
        bg="blackAlpha.300"
        borderRadius={4}
        cursor="pointer"
        onClick={onOpen}
      >
        <Text textAlign='center' color="whiteAlpha.800">find or start a conversation</Text>
          </Box>
          <ConversationModal isOpen={isOpen} onClose={onClose} session={session}  />
      {conversations.map(conversation => {
        const participant = conversation.participants.find((p)=> p.user.id === userId)
        return (
        <ConversationItem
            key={conversation.id}
            userId={userId}
            conversation={conversation}
            onClick={() => { onViewConversation(conversation.id, participant?.hasSeenLatestMessage) }}
            isSelected={conversation.id === router.query.conversationId}
            hasSeenLatestMessage={participant?.hasSeenLatestMessage}
        />)
      })
      }
    </Box>
  );
};
export default ConversationList;
