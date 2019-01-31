import { GANACHE_NETWORK_ID } from './constants';
import { NetworkSpecificConfigs } from './types';

export const TX_DEFAULTS = { gas: 400000 };
export const MNEMONIC = 'mimic soda meat inmate cup someone labor odor invest scout fat ketchup';
export const BASE_DERIVATION_PATH = `44'/60'/0'/0`;
export const CONFIGS: NetworkSpecificConfigs = {
    rpcUrl: 'http://127.0.0.1:8669',
    networkId: 10,
};
export const NETWORK_CONFIGS = CONFIGS;