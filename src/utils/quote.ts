import {
  POOL_FACTORY_CONTRACT_ADDRESS,
  QUOTER_CONTRACT_ADDRESS,
  UNISWAP_FEE_TIRE,
} from "@/constants";

import { ethers } from "ethers";
import { computePoolAddress } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import { fromReadableAmount, toReadableAmount } from "./format";

export async function getQuote({
  provider,
  tokenA,
  tokenB,
  amountIn,
}: {
  provider: ethers.BrowserProvider;
  tokenA: Token;
  tokenB: Token;
  amountIn: number;
}): Promise<string> {
  try {
    const quoterContract = new ethers.Contract(
      QUOTER_CONTRACT_ADDRESS,
      Quoter.abi,
      provider
    );
    const poolConstants = await getPoolConstants({
      provider,
      tokenA,
      tokenB,
    });

    console.log({ poolConstants });

    const quotedAmountOut =
      await quoterContract.quoteExactInputSingle.staticCall(
        poolConstants.token0,
        poolConstants.token1,
        poolConstants.fee,
        fromReadableAmount(amountIn, tokenA.decimals).toString(),
        0
      );

    console.log({ quotedAmountOut });

    return toReadableAmount(quotedAmountOut, tokenB.decimals);
  } catch (error) {
    throw error;
  }
}

async function getPoolConstants({
  provider,
  tokenA,
  tokenB,
}: {
  provider: ethers.BrowserProvider;
  tokenA: Token;
  tokenB: Token;
}): Promise<{
  token0: string;
  token1: string;
  fee: number;
}> {
  try {
    const currentPoolAddress = computePoolAddress({
      factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
      tokenA,
      tokenB,
      fee: UNISWAP_FEE_TIRE,
    });

    const poolCode = await provider.getCode(currentPoolAddress);
    if (poolCode === "0x") {
      throw new Error("Pool does not exist at the computed address");
    }
    const blockNumber = await provider.getBlockNumber();
    console.log({ blockNumber });
    console.log({ currentPoolAddress });

    const poolContract = new ethers.Contract(
      currentPoolAddress,
      IUniswapV3PoolABI.abi,
      provider
    );
    const [token0, token1, fee] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
    ]);

    console.log({
      token0,
      token1,
      fee,
    });

    return {
      token0,
      token1,
      fee,
    };
  } catch (error) {
    throw error;
  }
}
