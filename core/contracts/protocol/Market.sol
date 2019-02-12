pragma solidity 0.5.0;

import "./interfaces/IMarket.sol";

import "./BettingExchange.sol";
import "../token/OutcomeShareToken.sol";

import "./libs/LibConstants.sol";
import "./libs/LibSafeMath.sol";

import "../utils/Utils.sol";

contract Market is
    IMarket,
    LibConstants,
    LibMarket,
    Utils
{

    using LibSafeMath for uint256;

    // DBET token address (base currency)
    ERC20 public token;
    // ERC20 proxy address
    address public erc20Proxy;
    // Owner of market contract
    address public owner;
    // Betting exchange contract
    address public exchange;
    // Admins mapping
    mapping (address => bool) public admins;
    // Market ID to details mapping
    mapping (bytes32 => EventMarket) public markets;
    // Number of markets
    uint256 public marketCount;

    // New market event
    event LogNewMarket(
        bytes32 indexed id,
        uint256 indexed categoryId,
        address admin
    );
    // New outcome share token
    event LogNewOutcomeShareToken(
        bytes32 indexed marketId,
        bytes32 outcome,
        string _type,
        bytes32 name,
        address _address
    );
    // Winning outcome event
    event LogWinningOutcome(
        bytes32 indexed marketId,
        bytes32 outcome
    );
    // On add admin event
    event LogAddAdmin(
        address indexed _address
    );
    // On remove admin event
    event LogRemoveAdmin(
        address indexed _address
    );

    constructor(
        address _token,
        address _erc20Proxy
    )
    public {
        token = ERC20(_token);
        erc20Proxy = _erc20Proxy;
        owner = msg.sender;
        // Make owner an admin
        admins[owner] = true;
    }

    /**
    * Sets the betting exchange contract
    * @param _exchange Address of betting exchange contract
    * @return bool whether exchange address was updated
    */
    function setBettingExchange(address _exchange)
    public
    returns (bool) {
        require(
            msg.sender == owner,
            "INVALID_SENDER"
        );
        exchange = _exchange;
        return true;
    }

    /**
    * Creates a new betting market
    * @param marketType Type of market to open - one side or p2p
    * @param categoryId Category ID
    * @param eventStart Time the event starts
    * @param marketOpen Time the betting market opens
    * @param marketClose Time the betting market closes
    * @param outcomes All possible outcomes to bet on
    * @param minBet Minimum amount in DBETs to bet
    * @param maxBet Maximum amount in DBETs to bet
    * @param ipfsHash Hash of betting market details pushed to IPFS
    * @return bytes32 Unique ID for betting market
    */
    function createBettingMarket(
        uint8 marketType,
        uint256 categoryId,
        uint256 eventStart,
        uint256 marketOpen,
        uint256 marketClose,
        bytes32[] memory outcomes,
        uint256 minBet,
        uint256 maxBet,
        string memory ipfsHash
    )
    public
    returns (bytes32) {
        // Betting exchange address must be set
        require(
            exchange != address(0),
            "INVALID_EXCHANGE_ADDRESS"
        );
        // msg.sender must be an admin
        require(
            admins[msg.sender],
            "INVALID_SENDER"
        );
        // marketOpen must be before eventStart and cannot be in the past
        require(
            marketOpen >= block.timestamp &&
            marketOpen < eventStart,
            "INVALID_MARKET_OPEN"
        );
        // marketClose must be after marketOpen and before eventStart
        require(
            marketClose > marketOpen &&
            marketClose < eventStart,
            "INVALID_MARKET_CLOSE"
        );
        // eventStart cannot be in the past
        require(
            eventStart >= block.timestamp,
            "INVALID_EVENT_START"
        );
        // Outcomes must be greater than or equal to 1
        require(
            outcomes.length >= 1,
            "INVALID_OUTCOMES"
        );
        // minBet and maxBet cannot be 0 and minBet must always be lesser or equal to maxBet
        require(
            minBet != 0 &&
            maxBet != 0 &&
            maxBet >= minBet,
            "INVALID_BET_AMOUNTS"
        );
        // IPFS hash must not be null
        require(
            bytes(ipfsHash).length != 0,
            "INVALID_IPFS_HASH"
        );

        // Create betting market and retrieve it's unique ID
        bytes32 id = createBettingMarketInternal(
            marketType,
            categoryId,
            eventStart,
            marketOpen,
            marketClose,
            outcomes,
            minBet,
            maxBet,
            ipfsHash
        );

        // Deploy outcome share tokens representing shares for all possible outcomes for the market
        deployOutcomeShareTokensInternal(
            id,
            outcomes
        );

        // Emit new market event
        emit LogNewMarket(
            id,
            categoryId,
            msg.sender
        );
    }

    /**
    * Core logic to create a new betting market
    * @param marketType Type of market to open - one side or p2p
    * @param categoryId Category ID
    * @param eventStart Time the event starts
    * @param marketOpen Time the betting market opens
    * @param marketClose Time the betting market closes
    * @param outcomes All possible outcomes to bet on
    * @param minBet Minimum amount in DBETs to bet
    * @param maxBet Maximum amount in DBETs to bet
    * @param ipfsHash Hash of betting market details pushed to IPFS
    * @return bytes32 Unique ID for betting market
    */
    function createBettingMarketInternal(
        uint8 marketType,
        uint256 categoryId,
        uint256 eventStart,
        uint256 marketOpen,
        uint256 marketClose,
        bytes32[] memory outcomes,
        uint256 minBet,
        uint256 maxBet,
        string memory ipfsHash
    )
    internal
    returns (bytes32)
    {
        // Unique ID for market
        bytes32 id = sha256(
            abi.encodePacked(
                marketCount++,
                marketType,
                marketOpen,
                marketClose,
                eventStart,
                outcomes
            )
        );

        // Add to markets mapping
        markets[id] = EventMarket({
            marketType: MarketType(marketType),
            categoryId: categoryId,
            eventStart: eventStart,
            marketOpen: marketOpen,
            marketClose: marketClose,
            outcomes: outcomes,
            minBet: minBet,
            maxBet: maxBet,
            ipfsHash: ipfsHash,
            winningOutcome: 0x0
        });

        return id;
    }

    /**
    * Deploys share tokens for all possible outcomes for a market
    * @param id ID of market
    * @param outcomes All possible outcomes to bet on
    * @return whether deployment was successful
    */
    function deployOutcomeShareTokensInternal(
        bytes32 id,
        bytes32[] memory outcomes
    )
    internal
    {
        // Create long/short outcome share tokens for all possible outcomes
        for(uint8 i = 0; i < outcomes.length; i++) {
            // TODO: Use EIP-1167 to clone a deployed shareToken contract
            // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1167.md
            // https://github.com/AugurProject/augur/blob/45cc71f9237886540d584cdf34bd0a66a643dc08/packages/augur-core/source/contracts/libraries/CloneFactory.sol
            // https://github.com/AugurProject/augur/blob/45cc71f9237886540d584cdf34bd0a66a643dc08/packages/augur-core/source/contracts/reporting/Market.sol#L105

            // Create long tokens
            bytes32 longToken = getMarketOutcomeShareTokenName(
                id,
                outcomes[i],
                SHARE_LONG
            );
            markets[id].outcomeShareTokens[longToken] = address(new OutcomeShareToken(
                bytes32ToString(longToken), // Name
                bytes32ToString(longToken), // Symbol
                id,                         // Market ID
                exchange,                   // Betting exchange
                erc20Proxy                  // ERC20 proxy
            ));
            emit LogNewOutcomeShareToken(
                id,
                outcomes[i],
                SHARE_LONG,
                longToken,
                markets[id].outcomeShareTokens[longToken]
            );

            // Create short tokens
            bytes32 shortToken = getMarketOutcomeShareTokenName(
                id,
                outcomes[i],
                SHARE_SHORT
            );
            markets[id].outcomeShareTokens[shortToken] = address(new OutcomeShareToken(
                bytes32ToString(shortToken), // Name
                bytes32ToString(shortToken), // Symbol
                id,                          // Market ID
                exchange,                    // Betting exchange
                erc20Proxy                   // ERC20 proxy
            ));
            emit LogNewOutcomeShareToken(
                id,
                outcomes[i],
                SHARE_SHORT,
                shortToken,
                markets[id].outcomeShareTokens[shortToken]
            );
        }
    }

    /**
    * Resolves a market with a winning outcome
    * @param id Market ID
    * @param outcome Winning outcome
    * @return whether market resolution was successful
    */
    function resolveMarket(
        bytes32 id,
        bytes32 outcome
    )
    public
    returns (bool) {
        // Only admins can set winning outcomes
        require(
            admins[msg.sender],
            "INVALID_SENDER"
        );
        // Market must exist
        require(
            markets[id].outcomes.length > 0,
            "INVALID_MARKET_ID"
        );
        // Market must be closed
        require(
            markets[id].marketClose < block.timestamp,
            "INVALID_MARKET_CLOSE"
        );
        // Outcome must be valid
        bool isValid;
        for(uint i = 0; i < markets[id].outcomes.length; i++) {
            if(markets[id].outcomes[i] == outcome)
                isValid = true;
        }
        require(
            isValid,
            "INVALID_OUTCOME"
        );
        // Set winning outcome in market
        markets[id].winningOutcome = outcome;
        // Emit winning outcome event
        emit LogWinningOutcome(
            id,
            outcome
        );
    }

    /**
    * Redeems favorable outcome shares (long winning outcome/short losing outcome(s)) for a closed market
    * @param marketId Market ID
    */
    function redeemFavorableOutcomeShares(
        bytes32 marketId
    )
    public
    returns (uint256) {
        // Market must exist
        require(
            markets[marketId].outcomes.length > 0,
            "INVALID_MARKET_ID"
        );
        // Market must be closed
        require(
            markets[marketId].marketClose < block.timestamp,
            "INVALID_MARKET_CLOSE"
        );
        // Market must be resolved
        require(
            markets[marketId].winningOutcome != 0x0,
            "MARKET_NOT_RESOLVED"
        );
        // User must own winning outcome long shares or losing outcome short shares
        uint256 profitPerFavorableOutcomeToken =
            calculateProfitPerFavorableOutcomeShareToken(
                marketId
            );
        uint256 totalRedeemed;
        for(uint i = 0; i < markets[marketId].outcomes.length; i++) {
            uint256 favorableOutcomeShareTokenBalance = getMarketOutcomeShareTokenBalance(
                marketId,
                msg.sender,
                markets[marketId].outcomes[i],
                markets[marketId].outcomes[i] == markets[marketId].winningOutcome ?
                SHARE_LONG : SHARE_SHORT
            );
            // User has a positive favorable outcome share token balance
            if(favorableOutcomeShareTokenBalance > 0) {
                // Redeem favorable outcome share tokens for token balance in DBETs and profits per favorable token
                require(
                    BettingExchange(exchange).redeemFavorableOutcomeShareTokens(
                        marketId,
                        markets[marketId].outcomes[i],
                        msg.sender
                    ),
                    "BETTING_EXCHANGE_REDEEM_ERROR"
                );
                totalRedeemed = totalRedeemed.add(favorableOutcomeShareTokenBalance);
            }
        }
        return totalRedeemed;
    }

    /**
    * Returns user balance for an outcome share token
    * @param marketId Market ID
    * @param _address Address of user
    * @param outcome Market outcome
    * @param shareType Type of share (Long/short)
    */
    function getMarketOutcomeShareTokenBalance(
        bytes32 marketId,
        address _address,
        bytes32 outcome,
        string memory shareType
    )
    public
    view
    returns (uint256) {
        return ERC20(getMarketOutcomeShareToken(
            marketId,
            outcome,
            shareType
        )).balanceOf(_address);
    }

    /**
    * Returns total minted outcome share tokens for a market
    * @param marketId Market ID
    * @param outcome Market outcome
    * @param shareType Type of share (Long/short)
    */
    function getTotalMintedOutcomeShareTokens(
        bytes32 marketId,
        bytes32 outcome,
        string memory shareType
    )
    public
    view
    returns (uint256) {
        return OutcomeShareToken(getMarketOutcomeShareToken(
            marketId,
            outcome,
            shareType
        )).totalMinted();
    }

    /**
    * Calculate profit per favorable outcome share token
    * and calculate profit
    * @param marketId Market ID
    */
    function calculateProfitPerFavorableOutcomeShareToken(
        bytes32 marketId
    )
    public
    view
    returns (uint256) {
        uint256 totalMintedFavorable;
        uint256 totalMintedUnfavorable;
        for(uint i = 0; i < markets[marketId].outcomes.length; i++) {
            if(markets[marketId].outcomes[i] == markets[marketId].winningOutcome) {
                // Add total minted long shares of winning outcome to total favorable
                totalMintedFavorable = totalMintedFavorable.add(
                    getTotalMintedOutcomeShareTokens(
                        marketId,
                        markets[marketId].outcomes[i],
                        SHARE_LONG
                    )
                );
                // Add total minted short shares of winning outcome to total unfavorable
                totalMintedUnfavorable = totalMintedUnfavorable.add(
                    getTotalMintedOutcomeShareTokens(
                        marketId,
                        markets[marketId].outcomes[i],
                        SHARE_SHORT
                    )
                );
            } else {
                // Add total minted short shares of winning outcome to total favorable
                totalMintedFavorable = totalMintedFavorable.add(
                    getTotalMintedOutcomeShareTokens(
                        marketId,
                        markets[marketId].outcomes[i],
                        SHARE_SHORT
                    )
                );
                // Add total minted long shares of winning outcome to total unfavorable
                totalMintedUnfavorable = totalMintedUnfavorable.add(
                    getTotalMintedOutcomeShareTokens(
                        marketId,
                        markets[marketId].outcomes[i],
                        SHARE_LONG
                    )
                );
            }
        }
        // Calculate profit per favorable outcome share token
        // (Unfavorable/favorable) share tokens
        return totalMintedUnfavorable.div(totalMintedFavorable);
    }


    /**
    * Adds an admin to the market contract
    * @param _address Address to add as admin
    * @return whether admin was added
    */
    function addAdmin(
        address _address
    )
    public
    returns (bool) {
        require(
            msg.sender == owner,
            "INVALID_SENDER"
        );
        admins[_address] = true;
        emit LogAddAdmin(_address);
    }

    /**
    * Removes an admin from the market contract
    * @param _address Address of admin
    * @return whether admin was removed
    */
    function removeAdmin(
        address _address
    )
    public
    returns (bool) {
        require(
            msg.sender == owner,
            "INVALID_SENDER"
        );
        admins[_address] = false;
        emit LogRemoveAdmin(_address);
    }

    /**
    * Returns market outcome count for a market by ID
    * @param marketId ID of a market
    * @return Number of outcomes
    */
    function getMarketOutcomeCount(
        bytes32 marketId
    )
    public
    view
    returns (uint256) {
        return markets[marketId].outcomes.length;
    }

    /**
    * Returns market outcomes for a market by ID at index
    * @param marketId ID of a market
    * @param index Index of outcome
    * @return Outcome at index
    */
    function getMarketOutcomeAtIndex(
        bytes32 marketId,
        uint256 index
    )
    public
    view
    returns (bytes32) {
        return markets[marketId].outcomes[index];
    }

    /**
    * Returns address for an outcome share token based on it's name
    * @param marketId ID of a market
    * @param outcomeShareTokenName Outcome share token name
    */
    function getMarketOutcomeShareToken(
        bytes32 marketId,
        bytes32 outcomeShareTokenName
    )
    public
    view
    returns (address) {
        return markets[marketId].outcomeShareTokens[outcomeShareTokenName];
    }

    /**
    * Returns address for an outcome share token based on it's outcome type
    * @param marketId Market ID
    * @param outcome Market outcome
    * @param shareType Type of share (Long/short)
    */
    function getMarketOutcomeShareToken(
        bytes32 marketId,
        bytes32 outcome,
        string memory shareType
    )
    public
    view
    returns (address) {
        bytes32 outcomeShareTokenName = getMarketOutcomeShareTokenName(
            marketId,
            outcome,
            shareType
        );
        return getMarketOutcomeShareToken(
            marketId,
            outcomeShareTokenName
        );
    }

    /**
    * Returns name for an outcome share token
    * @param marketId ID of a market
    * @param outcome outcome
    * @param shareType long/short
    * @return name of outcome share token
    */
    function getMarketOutcomeShareTokenName(
        bytes32 marketId,
        bytes32 outcome,
        string memory shareType
    )
    public
    view
    returns (bytes32) {
        return sha256(
            abi.encodePacked(
                marketId,
                outcome,
                shareType
            )
        );
    }

    /**
    * Market mapping accessor function
    * @param marketId ID of a market
    * @return Unpacked market struct
    */
    function getMarketInfo(
        bytes32 marketId
    )
    public
    view
    returns (
        uint8,
        uint256,
        uint256,
        uint256,
        string memory,
        bytes32
    ) {
        return (
            (uint8) (markets[marketId].marketType),
            markets[marketId].eventStart,
            markets[marketId].marketOpen,
            markets[marketId].marketClose,
            markets[marketId].ipfsHash,
            markets[marketId].winningOutcome
        );
    }

}
