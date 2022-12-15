import { Flex, Avatar,Stack, Text, Button } from "@chakra-ui/react";
import { SearchedUser } from "../../../utils/types";
interface UserSearchListProps  {
    users: Array<SearchedUser>
    addParticipants:(user:SearchedUser) => void
};

const UserSearchList:React.FC<UserSearchListProps> = ({users,addParticipants}) => {
    
    return <>
        {users.length === 0 ? (
            <Flex mt={6} justify='center'>
                <Text>no users found</Text>
                </Flex>
        ) : (
                <Stack mt={6}>
                    {users.map((user) => (
                        <Stack
                            key={user.id}
                            direction="row"
                            align='center'
                            spacing={4}
                            py={2}
                            px={4}
                            borderRadius={4}
                            _hover={{bg:"whiteAlpha.200"}}
                        >
                            <Avatar />
                            <Flex justify='space-between' width="100%" align='center'>
                                <Text>{user.username}</Text>
                                <Button bg="brand.100" _hover={{ bg: "brand.100" }}
                                onClick={()=>{addParticipants(user)}}>Select</Button>
                                </Flex>
                            </Stack>
                     ))} 
              </Stack>  
        )
        }
        </>
}
export default UserSearchList;