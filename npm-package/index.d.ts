import { ContractAbi } from "ethereum-protocol";

type ContractWrapper = {
  raw: {
    abi: ContractAbi;
  };
  /**
   * Testnet Address
   */
  "0x27": string;

  /**
   * Mainnet Address
   */
  "0xc7": string;

  /**
   * Mainnet Address
   */
  "0x4a": string;

  /**
   * Thor Snapshot Address
   */
  "0xa4": string;
};

export declare const DBETVETTokenContract: ContractWrapper;
export declare const ExchangeContract: ContractWrapper;
export declare const MarketContract: ContractWrapper;
export declare const BettingExchangeContract: ContractWrapper;
export declare const VERSION: string;
