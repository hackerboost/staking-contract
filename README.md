# Integrating Wagmi V2 and Rainbowkit in Your NextJs Frontend


## Create the frontend project
```sh
npx create-next-app@latest
```

## Add Wagmi to the project, install the required packages
```sh
npm install wagmi viem@2.x @tanstack/react-query
```

## Let’s create and export a new config using createConfig, in `lib/config.ts`
```typeScript
'use client';

import { http, createStorage, cookieStorage } from 'wagmi'
import { sepolia, arbitrumSepolia, optimismSepolia } from 'wagmi/chains'
import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit'

const projectId = '';

const supportedChains: Chain[] = [sepolia, arbitrumSepolia, optimismSepolia];

export const config = getDefaultConfig({
   appName: 'WalletConnection',
   projectId,
   chains: supportedChains as any,
   ssr: true,
   storage: createStorage({
    storage: cookieStorage,
   }),
  transports: supportedChains.reduce((obj, chain) => ({ ...obj, [chain.id]: http() }), {})
 });
 ```

In this example, Wagmi is configured to use the Sepolia, arbitrumSepolia and optimismSepolia chains, wrapped in supportedChains array.

Wagmi uses client-side storage for fast initial data, but this can cause issues with SSR frameworks like Next.js. Enabling the ssr property in Wagmi config fixes this by hydrating the data on the client after the initial render.

Here, we use cookieStorage to store Wagmi data in browser cookies. This allows persistence across page refreshes within the same browser.

The reduce function iterates through the supportedChains array. For each chain, it creates a key-value pair in the transports object ( [arbitrumSepolia.id]: http() ). These transports handle making HTTP requests to the blockchain nodes for interactions and data retrieval.

## Let’s create and export the providers file, in `app/providers.tsx`
```typeScript
"use client";

import { WagmiProvider, cookieToInitialState} from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { config } from "./lib/config";

const queryClient = new QueryClient();

type Props = {
  children: React.ReactNode;
  cookie?: string | null;
};

export default function Providers({ children, cookie }: Props) {
    const initialState = cookieToInitialState(config, cookie);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#0E76FD",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

We are marking the component "use client" as it wraps libraries ( WagmiProvider, QueryClientProvider, RainbowKitProvider ) that rely on browser-specific functionalities. Since it will be imported in layout.tsx ( a Server Component ), marking it "use client" ensures these libraries are only loaded and executed on the client-side (user’s browser) during hydration. This prevents unnecessary code execution on the server and improves initial page load performance.

 