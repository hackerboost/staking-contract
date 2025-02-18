# Integrating Wagmi V2 and RainbowKit in Your Next.js Frontend

In this tutorial, we'll walk through the process of integrating Wagmi V2 and RainbowKit into a Next.js application, providing more details and explanations for better understanding.

## 1. Create the Frontend Project
To begin, let's create a Next.js application. Run the following command to set up a new project:

```bash
npx create-next-app@latest
```

Follow the prompts to name your project and choose the necessary configurations. Once the setup is complete, navigate into your project directory.

```bash
cd staking-dapp
```

## 2. Install Required Packages
Wagmi, Viem, and React Query are essential libraries for blockchain interactions and state management. Install them using the following command:

```bash
npm install wagmi viem@2.x @tanstack/react-query @rainbow-me/rainbowkit
```

**Explanation:**
- `wagmi`: A collection of React hooks for interacting with Ethereum.
- `viem`: A TypeScript-first Ethereum client for interaction with smart contracts.
- `@tanstack/react-query`: A powerful data-fetching library.
- `@rainbow-me/rainbowkit`: A customizable wallet connection library.

## 3. Configure Wagmi in `lib/config.ts`

Create a `lib` folder in the root directory and add a `config.ts` file. Then, add the following configuration:

```typescript
'use client';

import { http, createStorage, cookieStorage } from 'wagmi';
import { sepolia, arbitrumSepolia, optimismSepolia } from 'wagmi/chains';
import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit';

const projectId = '<YOUR_PROJECT_ID>'; // Replace with your actual project ID from RainbowKit

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

**Explanation:**
- **appName**: The name of your application.
- **projectId**: Obtain this from your RainbowKit dashboard.
- **chains**: We include Sepolia, Arbitrum Sepolia, and Optimism Sepolia test networks.
- **ssr**: Enables server-side rendering to avoid hydration issues.
- **storage**: Uses cookie storage for session persistence.
- **transports**: Dynamically creates HTTP transports for each supported chain.

### Important Note:
Wagmi uses client-side storage for better performance, but this can conflict with SSR frameworks like Next.js. Enabling SSR and using `cookieStorage` mitigates these issues.

## 4. Create a Provider Component

Create a file named `providers.tsx` in the `app` directory:

```tsx
"use client";

import { WagmiProvider, cookieToInitialState } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { config } from "../lib/config";

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

**Explanation:**
- **WagmiProvider**: Provides blockchain interaction context.
- **QueryClientProvider**: Enables caching and data fetching with React Query.
- **RainbowKitProvider**: Handles wallet connections with a custom theme.
- **cookieToInitialState**: Hydrates Wagmi's state using cookies.

### Integration in `layout.tsx`

Open `app/layout.tsx` and wrap your application with the `Providers` component:

```tsx
import Providers from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## 5. Contract Interaction Logic

Below is the detailed implementation of the contract interaction logic.

### Initialize Contract

```typescript
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

const CONTRACT_ADDRESS = "<YOUR_CONTRACT_ADDRESS>";
const ABI = [ /* ABI content here */ ];

const [contract, setContract] = useState<any>(null);
const [signer, setSigner] = useState<any>(null);

// Initialize contract when connected
const initialize = async () => {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractIns = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    setContract(contractIns);
    setSigner(signer);
  }
};

useEffect(() => {
  initialize();
}, []);
```

**Explanation:**
- Checks if `window.ethereum` is available.
- Creates an ethers provider and signer.
- Instantiates the contract with the signer.

### Fetch Wallet Balance

```typescript
const [walletBalance, setWalletBalance] = useState("0");

const getWalletBalance = async () => {
  if (!signer) return;
  const balance = await signer.getBalance();
  const etherBalance = ethers.formatEther(balance);
  setWalletBalance(etherBalance);
};

useEffect(() => {
  getWalletBalance();
}, [signer]);
```

### Stake and Unstake Functions

```typescript
const [stakingTab, setStakingTab] = useState(true);
const [unstakingTab, setUnstakingTab] = useState(false);

const switchToStake = () => {
  setStakingTab(true);
  setUnstakingTab(false);
};

const switchToUnstake = async () => {
  setStakingTab(false);
  setUnstakingTab(true);
  if (address) {
    const assetIds = await getAssetIds(address);
    getAssets(assetIds);
  }
};
```

### Fetch Asset Data

```typescript
interface Asset {
  positionId: number;
  percentInterest: number;
  daysRemaining: number;
  etherInterest: string;
  etherStaked: string;
  open: boolean;
}

const calcDaysRemaining = (unlockDate: number): number => {
  const timeNow = Date.now() / 1000;
  const secondsRemaining = unlockDate - timeNow;
  return Math.max(Number((secondsRemaining / 86400).toFixed(0)), 0);
};

const getAssetIds = async (address: string): Promise<number[]> => {
  if (!contract) return [];
  return await contract.getPositionIdsForAddress(address);
};

const getAssets = async (ids: number[]): Promise<void> => {
  if (!contract) return;
  const queriedAssets = await Promise.all(ids.map(id => contract.getPositionById(id)));

  const parsedAssets: Asset[] = queriedAssets.map((asset: any) => ({
    positionId: asset.positionId,
    percentInterest: Number(asset.percentInterest) / 100,
    daysRemaining: calcDaysRemaining(Number(asset.unlockDate)),
    etherInterest: ethers.formatEther(asset.weiInterest),
    etherStaked: ethers.formatEther(asset.weiStaked),
    open: asset.open,
  }));

  setAssets(parsedAssets);
};
```

### Staking and Withdrawal Actions

```typescript
const stakeEther = async (stakingLength: number) => {
  if (!contract) return;
  const wei = ethers.parseUnits(amount, "ether");
  const tx = await contract.stakeEther(stakingLength, { value: wei });
  await tx.wait();
  console.log("Staking successful");
};

const withdraw = async (positionId: number) => {
  if (!contract) return;
  const tx = await contract.closePosition(positionId);
  await tx.wait();
  console.log("Withdrawal successful");
};
```

## 6. Running the Application

To start your Next.js application, run:

```bash
npm run dev
```

Open your browser and visit `http://localhost:3000` to see your app in action.

## Conclusion
By following this detailed guide, you've successfully set up Wagmi V2 and RainbowKit in your Next.js application. You also implemented basic contract interactions, including staking, withdrawing, and balance fetching. Adjust the logic according to your DApp's requirements for more advanced features.

