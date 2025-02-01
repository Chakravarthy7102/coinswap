"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ArrowRightLeft, History, Loader2, Rabbit, Shell } from "lucide-react";
import Swap from "@/components/swap";
import TransactionHistory from "@/components/transaction-history";
import WrapETH from "@/components/wrap-eth";
import { useWallet } from "@/context/wallet-context";
import { Button } from "@/components/ui/button";
import { Fragment } from "react";

export default function Home() {
  const { address, provider, connect, isConnecting } = useWallet();

  if (!address || !provider) {
    return (
      <main className="items-center flex justify-center text-center mt-44">
        <div className="flex h-fit flex-col gap-5 row-start-2 items-center justify-center border max-w-5xl mx-4 py-16 px-6 md:px-32 rounded-md">
          <Rabbit className="text-primary size-10" />
          <p>
            {isConnecting
              ? "You should be promted by Metamask to connect."
              : "Please connect your wallet to to get started."}
          </p>
          <Button onClick={connect} disabled={isConnecting}>
            {isConnecting ? (
              <Fragment>
                Connecting <Loader2 className="animate-spin" />
              </Fragment>
            ) : (
              "Connect Wallet"
            )}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-8 row-start-2 items-start justify-start mt-32 max-w-4xl mx-auto px-5">
      <Tabs className="w-full" defaultValue="swap">
        <TabsList>
          <TabsTrigger className="flex gap-2" value="swap">
            <ArrowRightLeft className="size-4" />
            Swap
          </TabsTrigger>
          <TabsTrigger className="flex gap-2" value="wrap_eth">
            <Shell className="size-4" />
            Wrap Eth
          </TabsTrigger>
          <TabsTrigger className="flex gap-2" value="transaction_history">
            <History className="size-4" />
            Transaction History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="swap">
          <Swap />
        </TabsContent>
        <TabsContent value="wrap_eth">
          <WrapETH address={address} provider={provider} />
        </TabsContent>
        <TabsContent value="transaction_history">
          <TransactionHistory />
        </TabsContent>
      </Tabs>
    </main>
  );
}
