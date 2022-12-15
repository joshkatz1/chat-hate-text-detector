import { gql } from "@apollo/client";

export const userOperations = {
    Queries: {
        searchUsers: gql`
        query SearchUsers($username: String!) {
            searchUsers(username:$username){
                id
                username
                # image
     
                   }       }
            `,
    },
    
    Mutations: {
        createUsername: gql`
          mutation CreateUsername($username: String!) {
            createUsername(username: $username) {
              success
              error
            }
          }
        `,
      },
      Subscriptions: {},
    };