import gql from "graphql-tag";


const typeDefs = gql`

type User{
    id: String
    username: String
}

type Query{
    searchUsers(username: String) : [User]
}
type Mutation{
    createUsername(username:String): CreateUserNameResponse
}
type CreateUserNameResponse{
    success: Boolean
    error : String
}


`
export default typeDefs