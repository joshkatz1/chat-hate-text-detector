import { useMutation } from "@apollo/client";
import { Button, Center, Input, Stack, Text, Image } from "@chakra-ui/react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import {userOperations} from '../../graphql/operations/user'
import { CreateUsernameData, CreateUsernameVariables } from "../../utils/types";


type IAuthProps = {
  session: Session | null;
  reloadSession: () => void;
};

const Auth: React.FC<IAuthProps> = ({ session, reloadSession }) => {
  const [createUsername, { data, loading, error }] = useMutation<CreateUsernameData,CreateUsernameVariables>(userOperations.Mutations.createUsername);
  const [username, setUsername] = useState('')
  
  const onSubmit = async () => {
    try {
      if (!username) return;
      console.log(username);
      const { data } = await createUsername({ variables: { username } });
      if (!data?.createUsername) {
        throw new Error()
      }
      if (data.createUsername.error) {
        const { createUsername: { error }, } = data
        throw new Error(error)
      }
      toast.success("username succefuly created")
       reloadSession() 
      } catch (error:any) {
        toast.error(error?.message)
      }
        
    }
    return (
    <Center height="100vh">
      <Stack align="center" spacing={8}>
        {session ? (
                  <>
                      <Text fontSize='3xl'>Create a username</Text>
                        <Input placeholder="enter a user name"  
                         onChange={(event) => {setUsername(event.target.value)}}
                          value={username}
                        ></Input>
                        <Button width="100%" onClick={onSubmit} isLoading={loading} >
                            Submit
                        </Button>
                  </>
        ) : (
          <>
            <Text>ImessageGraphql </Text>
            <Button
              onClick={() => {
                signIn("google");
              }}
              leftIcon={
                <Image
                  src="images/googlelogo.png"
                  height="20px"
                  alt="google logo"
                />
              }
            >
              continue with google
            </Button>
          </>
        )}
      </Stack>
    </Center>
  );
};

export default Auth;
