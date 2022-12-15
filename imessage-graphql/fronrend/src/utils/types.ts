import {ConversationPopulated, MessagePopulated} from '../../../backend/src/utils/types'

  /**
   * user
   */
export interface CreateUsernameVariables{
    username: string
    
}
export interface CreateUsernameData {
    createUsername: {
        success: boolean
        error: string
    }
}
export interface SearchUsersData {
    searchUsers: Array<SearchedUser>;
  }
  
  export interface SearchUsersVariables {
    username: string;
  }
  
  export interface SearchedUser {
    id: string;
    username: string;
  }



  /**
   * conversation
   */
  
export interface CreateConversationData{
  createConversation: {
        conversationId: string
    }
}
  
export interface CreateConversationVariables{
  participantIds: Array<string>

}

export interface ConversationsData{
  
    conversations: Array<ConversationPopulated>
    
}
  
export interface ConversationVariables{
  

}

/**
 * Messages
 */
 export interface MessagesData {
  messages: Array<MessagePopulated>;
}

export interface MessagesVariables {
  conversationId: string;
}

export interface SendMessageVariables {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
}

export interface MessagesSubscriptionData {
  subscriptionData: {
    data: {
      messageSent: MessagePopulated;
    };
  };
}
