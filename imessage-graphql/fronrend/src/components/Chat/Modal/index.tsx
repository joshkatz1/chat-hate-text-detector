import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Text,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Modal,
  Stack,
  Input,
  Button,
} from "@chakra-ui/react";
import { Session } from 'next-auth';
import React, { useState } from "react";
import toast from "react-hot-toast";
import conversationOperations  from "../../../graphql/operations/conversation";
import { userOperations } from "../../../graphql/operations/user";
import { CreateConversationData, CreateConversationVariables, SearchedUser, SearchUsersData, SearchUsersVariables } from "../../../utils/types";
import Participants from "./Participants";
import UserSearchList from "./UserSearchList";
import {useRouter} from 'next/router'
type ModalProps = {
  session: Session;
  onClose: () => void;
  isOpen: boolean;

};



const ConversationModal: React.FC<ModalProps> = ({ isOpen, onClose, session }) => {
  {
    const router = useRouter();
    const { user: { id: userId }, } = session;
    const [username, setUsername] = useState('')
    const [participants, setParticipants] = useState<Array<SearchedUser>>([]);
    const [searchUsers, { data, loading }] = useLazyQuery<
      SearchUsersData,
      SearchUsersVariables
    >(userOperations.Queries.searchUsers);
    const [createConversation, { loading: conversationLoading }] = useMutation<
    CreateConversationData,
    CreateConversationVariables
      >(conversationOperations.Mutations.createConversation);
    console.log("here is data", data)




    const onCreateConversation = async () => {
      const participantIds = [userId, ...participants.map((p) =>  p.id)];
      try {
        const { data } = await createConversation({
          variables: { participantIds },
        });

        if (!data?.createConversation) { 
          throw new Error("failed to create conversation")
        }
        const { createConversation: {
          conversationId
        } } = data;
        router.push({ query: { conversationId } })

        setParticipants([])
        setUsername('')
        onClose();



        console.log('create conversation', data);
      } catch (error: any) {
        console.log('onCreateConversation error', error);
        toast.error(error?.message);
      }
    };


    const onSearch = async (event: React.FormEvent) => {
    
      event.preventDefault()
      console.log("enter function")
      await searchUsers({
        variables: {
          username
        }
      })
      console.log(username)
    
    }

    const addParticipant = (user: SearchedUser) => {
      setParticipants((prev) => [...prev, user])
      setUsername('')
    }
    const removeParticipant = (userId: string) => {
      setParticipants((prev) => prev.filter(u => u.id !== userId))
    }
    return (
      <>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Modal Title</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>Modal body</Text>
              <form onSubmit={onSearch}>
                <Stack spacing={4}>
                  <Input placeholder="enter a username" value={username} onChange={(event) => { setUsername(event.target.value) }} />
                  <Button type="submit" disabled={(!username)} isLoading={loading}>Search</Button>
              
                </Stack>
              </form>
              {data?.searchUsers && <UserSearchList users={data?.searchUsers} addParticipants={addParticipant} />}
              {participants.length != 0 &&
                <>
                  <Participants participants={participants} removeParticipant={removeParticipant} />
                  <Button bg='brand.100' width='100%' mt={6} _hover={{ bg: 'brand.100' }} onClick={onCreateConversation} isLoading={conversationLoading}>Create conversion </Button>
                </>
              }
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  };
}
export default ConversationModal;
