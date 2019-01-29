pragma solidity 0.5.0;

contract LibMarket {

    enum MarketType {
        ONE_SIDED,
        P2P
    }

    struct EventMarket {
        // Type of market
        MarketType marketType;
        // Category ID
        uint256 categoryId;
        // Event start time
        uint256 eventStart;
        // Market open time
        uint256 marketOpen;
        // Market close time
        uint256 marketClose;
        // Possible outcomes
        bytes32[] outcomes;
        // Address of ERC20 outcome share tokens corresponding to each outcome
        mapping (bytes32 => address) outcomeShareTokens;
        // Minimum possible bet amount in DBETs
        uint256 minBet;
        // Maximum possible bet amount in DBETs
        uint256 maxBet;
        // IPFS hash containing all market details
        string ipfsHash;
        // Winning outcome
        bytes32 winningOutcome;
    }

}
