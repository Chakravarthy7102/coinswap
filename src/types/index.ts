export type TokenDetails = {
  name: string;
  symbol: string;
  decimals: number;
};

export type SwapSummaryConfig = {
  swapRate: number;
  gasCost: number;
  finalAmount: number;
  priceImpact: number;
  minimumAmountOut: number;
};
