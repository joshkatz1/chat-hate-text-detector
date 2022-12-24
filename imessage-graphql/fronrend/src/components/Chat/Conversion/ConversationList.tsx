import { useMutation } from "@apollo/client";
import { Flex, Box, Text, Button } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useState } from "react";
import { ConversationPopulated } from "../../../../../backend/src/utils/types";
import Modal from "../Modal";
import ConversationModal from '../Modal'
import ConversationItem from "./ConversationItem";
import ConversationOperation from "../../../graphql/operations/conversation"
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";
interface ConversationListProps {
  session: Session;
  conversations: Array<ConversationPopulated>;
  onViewConversation: (conversationId: string | undefined, hasSeenLatestMessage?: boolean | undefined)
    => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ session,conversations,onViewConversation }) => {
  
  const [isOpen, setIsOpen] = useState(false)
  const [deleteConversation] = useMutation < { deleteConversation: boolean }, {conversationId: string }>(ConversationOperation.Mutations.deleteConversation)
    const sortedConversation = [...conversations].sort((a, b)=> b.updatedAt.valueOf() - a.updatedAt.valueOf())
  
    const onOpen = () => { setIsOpen(true) }
    const onClose = () => { setIsOpen(false) }
    const router = useRouter()    
  const { user: { id: userId } } = session
 
  const onDeleteConversation = async (conversationId: string)=>{
    try {
      toast.promise(
        deleteConversation({
          variables: {
            conversationId
          },
          update: () => {
            router.replace(typeof process.env.NEXT_PUBLIC_BASE_URL === "string" ?
              process.env.NEXT_PUBLIC_BASE_URL :"")
          }
        }),
        {
          loading: "Deleting Conversation...",
          success: "Conversation deleted",
          error: "Conversation could not be deleted",
        }
      );

      
    } catch (error) {
      console.log("onDeleteConversation error: " + error)
      
      
    }
    
  }
  return (
    <Box width="100%" position='relative' height='100%' overflow='hidden'>
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
      {sortedConversation.map(conversation => {
        const participant = conversation.participants.find((p)=> p.user.id === userId)
        return (
        <ConversationItem
            key={conversation.id}
            userId={userId}
            conversation={conversation}
            onClick={() => { onViewConversation(conversation.id, participant?.hasSeenLatestMessage) }}
            isSelected={conversation.id === router.query.conversationId}
            hasSeenLatestMessage={participant?.hasSeenLatestMessage}
            onDeleteConversation={onDeleteConversation}
        />)
      })
      }
  <Box
        position="absolute"
        // border='1px solid red'
        bottom={0}
        left={0}
        width="100%"
        px={8}
        zIndex={1}
      >
        <Button width="100%" onClick={() => signOut()}>
          Logout
        </Button>
      </Box>
  
      </Box>
  );
 
};
export default ConversationList;
