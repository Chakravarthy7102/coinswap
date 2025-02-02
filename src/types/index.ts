import { Token } from "@uniswap/sdk-core";

export type TokenDetails = {
  name: string;
  symbol: string;
};

export type SwapConfig = {
  rpc:
    | {
        local: string;
      }
    | {
        mainnet: string;
      };
  tokens: {
    in: Token;
    amountIn: number;
    out: Token;
    poolFee: number;
  };
};
