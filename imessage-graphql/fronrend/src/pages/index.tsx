import { Box, Button } from "@chakra-ui/react";
import type { NextPage, NextPageContext } from "next"
import {getSession, useSession, signIn, signOut } from "next-auth/react"
import Auth from "../components/Auth";
import Chat from "../components/Chat";
const Home: NextPage = () => {
  const { data: session } = useSession()
  console.log("here is the session", session)
  const reloadSession = () => { 
    const event = new Event("visibilitychange")
    document.dispatchEvent(event)
  };
    return (
      <Box>
        {session?.user.username ?   (
          <>
            <Button onClick={() => { signOut() }}>sign out</Button>
            <Chat session={session} />
          </>
        
         ) :(
          <Auth session={session} reloadSession={reloadSession} />

        ) 
        }
        
      </Box>
    )
}
export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
}

export default Home;
