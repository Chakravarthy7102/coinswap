import useBalances from "@/hooks/useBalances";
import { ethers } from "ethers";
import { AlertCircle, Info, InfoIcon, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  COMMON_ERC20_ABI,
  ETH_CHAINID,
  WETH_CONTRACT_ADDRESS,
  WETH_TOKEN_NAME,
  WETH_TOKEN_SYMBOL,
} from "@/constants";
import { TokenDetails } from "@/types";
import { getQuote } from "@/utils/quote";
import { Token } from "@uniswap/sdk-core";

type SwapDialogProps = {
  provider: ethers.BrowserProvider;
  address: string;
  setActiveTab: (value: string) => void;
};

export default function Swap({
  address,
  provider,
  setActiveTab,
}: SwapDialogProps) {
  const { wEthBalance } = useBalances({ address, provider });

  const [error, setError] = useState<string>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [estimatedGasCost, setEstimatedGasCost] = useState("0");
  const [erc20TokenAddress, setERC20TokenAddress] = useState("");
  const [wEthValueToSwap, setEthValueToSwap] = useState("0");
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | undefined>();
  const [isFetchingQuoteInformation, setIsFetchingQuoteInformation] =
    useState(false);

  async function handleERC20TokenAddressChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setError(undefined);
    setERC20TokenAddress(e.target.value);
  }

  function handleEthValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    if (Number(value) > Number(wEthBalance)) {
      setError("Insufficient WETH balance");
      return;
    }
    setError(undefined);
    setEthValueToSwap(value);
  }

  async function handleGetQuote() {
    if (!ethers.isAddress(erc20TokenAddress)) {
      setError("Invalid Ethereum address format!");
      return;
    }
    const code = await provider.getCode(erc20TokenAddress);

    if (code === "0x") {
      setError("ERC20 token not found!");
      return;
    }

    try {
      setIsFetchingQuoteInformation(true);

      const contractDetails = new ethers.Contract(
        erc20TokenAddress,
        COMMON_ERC20_ABI,
        provider
      );

      const tokenName = await contractDetails.name();
      const tokenSymbol = await contractDetails.symbol();

      setTokenDetails({
        name: tokenName,
        symbol: tokenSymbol,
      });
      setLoading(true);
      setError(undefined);

      const quote = await getQuote({
        amountIn: Number(wEthValueToSwap),
        provider,
        tokenA: new Token(
          ETH_CHAINID,
          WETH_CONTRACT_ADDRESS,
          18,
          WETH_TOKEN_SYMBOL,
          WETH_TOKEN_NAME
        ),
        tokenB: new Token(
          ETH_CHAINID,
          erc20TokenAddress,
          18,
          tokenSymbol,
          tokenName
        ),
      });

      console.log({ quote });
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingQuoteInformation(false);
    }
  }

  async function handleSwap() {
    if (!ethers.isAddress(erc20TokenAddress)) {
      setError("Invalid Ethereum address format!");
      return;
    }

    const code = await provider.getCode(erc20TokenAddress);

    if (code === "0x") {
      setError("ERC20 token not found!");
      return;
    }

    const contractDetails = new ethers.Contract(
      erc20TokenAddress,
      COMMON_ERC20_ABI,
      provider
    );

    const tokenName = await contractDetails.name();
    const tokenSymbol = await contractDetails.symbol();

    setTokenDetails({
      name: tokenName,
      symbol: tokenSymbol,
    });
    setLoading(true);
    setError(undefined);
  }

  return (
    <div className="mt-10 space-y-8">
      <form
        className="space-y-5 p-4 border rounded-lg shadow-md mt-10"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="space-y-2">
          <Label htmlFor="erc20TokenAddress">WETH Amount</Label>
          <Input
            id="wEthAmount"
            name="wETHAmount"
            placeholder="0"
            type="number"
            onInput={handleEthValueChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wETHAmount">ERC 20 Token Address</Label>
          <Input
            id="wETHAmount"
            name="wETHAmount"
            placeholder="0x0000000000000000000000000000000000000000"
            onInput={handleERC20TokenAddressChange}
            required
          />
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {isSuccess ? (
          <Alert variant="success">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Your tranaction was successful</AlertDescription>
          </Alert>
        ) : null}
        <p className="mt-2 text-xs flex items-center">
          <Info className="size-4 text-primary mr-2" /> Estimated Gas:{" "}
          {estimatedGasCost} ETH
        </p>
        <Button
          onClick={handleGetQuote}
          className="w-full"
          disabled={
            !wEthValueToSwap || !erc20TokenAddress || isFetchingQuoteInformation
          }
        >
          {loading ? "Getting Quote..." : "Get Quote"}
        </Button>
        {/* <Button
          onClick={handleSwap}
          className="w-full"
          disabled={
            loading || !erc20TokenAddress || !wEthValueToSwap
          }
        >
          {loading ? "Swaping..." : "Swap"}
        </Button> */}
      </form>
      <Alert variant="default">
        <InfoIcon className="size-4" />
        <AlertTitle className="mt-1.5 flex items-center gap-1">
          Balances Info
        </AlertTitle>
        <AlertDescription className="space-y-5 mt-3">
          <div className="grid grid-cols-2 text-sm gap-x-2 w-72">
            <h4 className="font-medium ">Wrapped Ethereum</h4>{" "}
            <span className="font-semibold font-mono">
              : {wEthBalance} WETH
            </span>
          </div>
          <Button
            onClick={() => setActiveTab("wrap_eth")}
            className="w-full"
            variant="outline"
            size="sm"
          >
            <Plus />
            Add WETH
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
