import { ethers } from "ethers";
import { Token, Percent, CurrencyAmount, TradeType } from "@uniswap/sdk-core";
import { Route, Trade, Pair } from "@uniswap/v2-sdk";
import UniswapV2PairABI from "@uniswap/v2-core/build/UniswapV2Pair.json";

const slippageTolerance = new Percent("50", "10000"); // Default Uniswap value

export async function getQuote({
  provider,
  tokenA,
  tokenB,
  amountIn,
}: {
  provider: ethers.BrowserProvider;
  tokenA: Token;
  tokenB: Token;
  amountIn: string;
}): Promise<{
  minimumAmountOut: number;
  priceImpact: number;
  executionPrice: number;
  outputAmount: number;
}> {
  try {
    const tokens = [tokenA, tokenB];
    const pairAddress = Pair.getAddress(tokenA, tokenB);

    const pairContract = new ethers.Contract(
      pairAddress,
      UniswapV2PairABI.abi,
      provider
    );
    const reserves = await pairContract.getReserves();
    const [reserve0, reserve1] = reserves;

    const [token0, token1] = tokens[0].sortsBefore(tokens[1])
      ? tokens
      : [tokens[1], tokens[0]];

    const pair = new Pair(
      CurrencyAmount.fromRawAmount(token0, Number(reserve0)),
      CurrencyAmount.fromRawAmount(token1, Number(reserve1))
    );

    const route = new Route([pair], tokenA, tokenB);
    const amountInWei = ethers.parseUnits(amountIn, tokenA.decimals).toString();

    const trade = new Trade(
      route,
      CurrencyAmount.fromRawAmount(tokenA, amountInWei),
      TradeType.EXACT_INPUT
    );

    return {
      minimumAmountOut: Number(
        trade.minimumAmountOut(slippageTolerance).toExact()
      ),
      priceImpact: Number(trade.priceImpact?.toSignificant(6) || "0"),
      executionPrice: Number(trade.executionPrice.toSignificant(8)),
      outputAmount: Number(trade.outputAmount.toSignificant(8)),
    };
  } catch (error) {
    throw error;
  }
}

const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const ISwapRouterArtifact = [
  {
    inputs: [
      { internalType: "address", name: "_factory", type: "address" },
      { internalType: "address", name: "_WETH", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "WETH",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountOutMin", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapExactETHForTokens",
    outputs: [
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "amountOutMin", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountOut", type: "uint256" },
      { internalType: "uint256", name: "amountInMax", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapTokensForExactTokens",
    outputs: [
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export async function executeSwap({
  provider,
  tokenA,
  tokenB,
  amountIn,
}: {
  provider: ethers.BrowserProvider;
  tokenA: Token;
  tokenB: Token;
  amountIn: string;
}) {
  try {
    const tokens = [tokenA, tokenB];
    const pairAddress = Pair.getAddress(tokenA, tokenB);
    const wallet = await provider.getSigner();

    const pairContract = new ethers.Contract(
      pairAddress,
      UniswapV2PairABI.abi,
      provider
    );
    const reserves = await pairContract.getReserves();
    const [reserve0, reserve1] = reserves;

    const [token0, token1] = tokens[0].sortsBefore(tokens[1])
      ? tokens
      : [tokens[1], tokens[0]];

    const pair = new Pair(
      CurrencyAmount.fromRawAmount(token0, Number(reserve0)),
      CurrencyAmount.fromRawAmount(token1, Number(reserve1))
    );

    const route = new Route([pair], tokenA, tokenB);
    const amountInWei = ethers.parseUnits(amountIn, tokenA.decimals).toString();

    const trade = new Trade(
      route,
      CurrencyAmount.fromRawAmount(tokenA, amountInWei),
      TradeType.EXACT_INPUT
    );

    const minimumAmountOut = trade
      .minimumAmountOut(slippageTolerance)
      .toFixed();

    const router = new ethers.Contract(
      routerAddress,
      ISwapRouterArtifact,
      wallet
    );

    const wethContract = new ethers.Contract(
      tokenA.address,
      [
        "function approve(address spender, uint256 amount) public returns (bool)",
      ],
      wallet
    );

    const approveTx = await wethContract.approve(routerAddress, amountInWei);
    await approveTx.wait();

    const amountOutMin = ethers.parseUnits(minimumAmountOut, tokenB.decimals);
    const path = [tokenA.address, tokenB.address];
    const to = wallet.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

    const swapTx = await router.swapExactTokensForTokens(
      amountInWei,
      amountOutMin,
      path,
      to,
      deadline
    );

    await swapTx.wait();

    console.log(`Swap successful! Tx hash: ${swapTx.hash}`, swapTx);
    return swapTx.hash;
  } catch (error) {
    console.error("Swap failed:", error);
    throw error;
  }
}
