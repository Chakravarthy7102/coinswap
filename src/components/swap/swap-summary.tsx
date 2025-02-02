import React from "react";
import type { SwapSummaryConfig, TokenDetails } from "@/types";
import { Loader2 } from "lucide-react";

type SwapSummaryProps = {
  swapSummary: SwapSummaryConfig;
  tokenDetails: TokenDetails;
  isFetchingQuoteInformation: boolean;
};

export default function SwapSummary({
  swapSummary,
  tokenDetails,
  isFetchingQuoteInformation,
}: SwapSummaryProps) {
  if (isFetchingQuoteInformation) {
    return (
      <div className="mt-8 text-center text-gray-500 h-40 flex items-center justify-center">
        <Loader2 className="text-primary animate-spin size-8" />
      </div>
    );
  }
  return (
    <div className="p-4 shadow-lg rounded-lg w-full max-w-lg mx-auto mt-8">
      <h2 className="text-lg font-semibold mb-4 text-center">Swap Summary</h2>
      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-300">Swap Rate:</span>
          <span className="text-gray-500">
            {swapSummary.swapRate
              ? `1 WETH ~= ${swapSummary.swapRate} ${tokenDetails.symbol}`
              : "Loading..."}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Network Gas Cost:</span>
          <span className="text-red-500">
            -
            {swapSummary.gasCost !== null
              ? `${swapSummary.gasCost.toFixed(2)}`
              : "Loading..."}{" "}
            {tokenDetails.symbol}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Minimum Amount:</span>
          <span className="text-gray-500">{swapSummary.minimumAmountOut}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Price Impact:</span>
          <span className="text-gray-500">{swapSummary.priceImpact}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Max Slippage:</span>
          <span className="text-gray-500">0.50% (Default Uniswap)</span>
        </div>
        <hr />
        <div className="flex justify-between">
          <span className="text-gray-300 font-semibold">Expected receive:</span>
          <span className="text-green-500">
            ~ {swapSummary.finalAmount.toFixed(2)} {tokenDetails.symbol}
          </span>
        </div>
      </div>
    </div>
  );
}
