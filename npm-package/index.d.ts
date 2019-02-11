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

export type DBETVETTokenContract = ContractWrapper;
export type ExchangeContract = ContractWrapper;
export type MarketContract = ContractWrapper;
export type BettingExchangeContract = ContractWrapper;
export type VERSION = string;
