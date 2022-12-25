import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { ApolloProvider } from '@apollo/client';
import { theme } from "../chakra/theme";
import { client } from "../graphql/apollo-client";
import { Toaster } from "react-hot-toast";
import { RecoilRoot } from 'recoil';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <RecoilRoot>
    <ApolloProvider client={client}>
    <SessionProvider session={session}>
      <ChakraProvider theme={theme} cssVarsRoot="body">
          <Component {...pageProps} />
          <Toaster/>
      </ChakraProvider>
    </SessionProvider>
      </ApolloProvider>
      </RecoilRoot>
  );
}
