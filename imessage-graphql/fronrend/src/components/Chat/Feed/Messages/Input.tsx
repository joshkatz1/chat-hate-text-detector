import { useMutation } from "@apollo/client";
import { Box, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ObjectID } from "bson";
import { MessagesData, SendMessageVariables } from "../../../../utils/types";
import MessageOperations from "../../../../graphql/operations/message";
interface MessageInputProps {
  session: Session;
  conversationId: string;
}


const MessageInput: React.FC<MessageInputProps> = ({
  session,
  conversationId,
}) => {
  async function query(data: any) {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/IMSyPP/hate_speech_en",
      {
        headers: { Authorization: "Bearer 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" },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    if (result && result[0] && result[0][0]) {
      const label_value = result[0][0]["label"]
      const label = label_value.split("_")[1]
      return label;
    }
  }
  
 
  const [messageBody, setMessageBody] = useState("");
  const [sendMessage] = useMutation<
    { sendMessage: boolean },
    SendMessageVariables
  >(MessageOperations.Mutation.sendMessage);

    const onSendMessage = async (event: React.FormEvent) => {
      event.preventDefault();

      try {
        const { id: senderId } = session.user;
        const messageId = new ObjectID().toString();
        const newMessage: SendMessageVariables = {
          id: messageId,
          senderId,
          conversationId,
          body: messageBody,
        }
        const label = await query({ "inputs": newMessage.body });
        setMessageBody("");
        if (label > 0) {
          return
        }
      
      
      
        
      
      
        const { data, errors } = await sendMessage({
          variables: {
            ...newMessage,
          },
          optimisticResponse: { sendMessage: true },
          update: (cache) => {
            const existing = cache.readQuery<MessagesData>({
              query: MessageOperations.Query.messages,
              variables: { conversationId },
            }) as MessagesData;
            cache.writeQuery<MessagesData, { conversationId: string }>({
              query: MessageOperations.Query.messages,
              variables: { conversationId },
              data: {
                ...existing,
                messages: [
                  {
                    id: messageId,
                    body: messageBody,
                    senderId: session.user.id,
                    conversationId,
                    sender: {
                      id: session.user.id,
                      username: session.user.username,
                    },
                    createdAt: new Date(Date.now()),
                    updatedAt: new Date(Date.now()),
                  },
                  ...existing?.messages,
                ],
              },
            });
          },
        });
        if (!data?.sendMessage || errors) {
          console.log("Error sending message", errors)
          throw new Error("Error sending message");
        }
      }
  


    catch (error: any) {
      console.log("onSendMessageError",error);
      toast.error(error?.message);
    }
  };

  return (
    <Box px={4} py={6} width="100%">
      <form onSubmit={onSendMessage}>
        <Input
          value={messageBody}
          onChange={(event) => setMessageBody(event.target.value)}
          size="md"
          placeholder="New message"
          color="whiteAlpha.900"
          resize="none"
          _focus={{
            boxShadow: "none",
            borderColor: "whiteAlpha.300",
          }}
          _hover={{
            borderColor: "whiteAlpha.300",
          }}
        />
      </form>
    </Box>
  );
};
export default MessageInput;
