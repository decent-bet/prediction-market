pragma solidity 0.5.0;
pragma experimental ABIEncoderV2;

import "../0x/protocol/Exchange/interfaces/IExchange.sol";
import "../0x/protocol/Exchange/libs/LibOrder.sol";
import "../0x/utils/ReentrancyGuard/ReentrancyGuard.sol";

import "./libs/LibBytes.sol";
import "./libs/LibConstants.sol";
import "./libs/LibSafeMath.sol";

import "./Market.sol";
import "../token/OutcomeShareToken.sol";

// Wrapper for 0x exchange contract.
// Mints outcome share tokens for all order fills.
contract BettingExchange is
    LibConstants,
    ReentrancyGuard
{

    using LibBytes for bytes;
    using LibSafeMath for uint256;

    // Exchange contract.
    // solhint-disable-next-line var-name-mixedcase
    IExchange internal EXCHANGE;
    Market internal market;
    ERC20 public token;

    // Redeem outcome share tokens event
    event LogRedeemOutcomeShareTokens(
        bytes32 indexed marketId,
        bytes32 outcome,
        address indexed user
    );

    constructor (
        address _exchange,
        address _market
    )
        public
    {
        EXCHANGE = IExchange(_exchange);
        market = Market(_market);
        token = ERC20(market.token());
    }

    /// @dev Fills an order using `msg.sender` as the taker.
    /// @param marketId ID of betting market
    /// @param outcome Outcome being bet on
    /// @param isLong is order filling a long or short position
    /// @param order Order struct containing order specifications.
    /// @param takerAssetFillAmount Desired amount of takerAsset to sell.
    /// @param salt Arbitrary value to guarantee uniqueness of 0x transaction hash.
    /// @param makerSignature Proof that order has been created by maker.
    /// @param takerSignature Proof that taker wishes to call this function with given params.
    /// @return bool Whether order fill was successful
    function fillOrder(
        bytes32 marketId,
        bytes32 outcome,
        bool isLong,
        LibOrder.Order memory order,
        uint256 takerAssetFillAmount,
        uint256 salt,
        bytes memory makerSignature,
        bytes memory takerSignature
    )
    public
    nonReentrant
    returns (bool) {
        require(
            assertValidFillOrderParams(
                marketId,
                outcome,
                order,
                takerAssetFillAmount
            ),
            "INVALID_FILL_ORDER"
        );

        address longShareToken = market.getMarketOutcomeShareToken(
            marketId,
            market.getMarketOutcomeShareTokenName(
                marketId,
                outcome,
                SHARE_LONG
            )
        );
        address shortShareToken = market.getMarketOutcomeShareToken(
            marketId,
            market.getMarketOutcomeShareTokenName(
                marketId,
                outcome,
                SHARE_SHORT
            )
        );

        require(
            fillOrderInternal(
                longShareToken,
                shortShareToken,
                isLong,
                order,
                takerAssetFillAmount,
                salt,
                makerSignature,
                takerSignature
            )
        );
    }

    /**
    * Assert that fill order parameters are valid
    * @param marketId ID of market
    * @param outcome Outcome being bet on
    * @param order Order struct containing order specifications.
    * @param takerAssetFillAmount Desired amount of takerAsset to sell.
    * @return whether fill order parameters are valid
    */
    function assertValidFillOrderParams(
        bytes32 marketId,
        bytes32 outcome,
        LibOrder.Order memory order,
        uint256 takerAssetFillAmount
    )
    public
    view
    returns (bool) {
        string memory ipfsHash;
        uint256 marketClose;
        address takerAddress = msg.sender;

        (,,,marketClose,ipfsHash,) = market.getMarketInfo(marketId);

        // Check if market exists
        require(bytes(ipfsHash).length != 0, "INVALID_IPFS_HASH");
        // Check if bets are allowed
        require(marketClose >= block.timestamp, "INVALID_MARKET_CLOSE");
        // Check if takerAssetFillAmount > 0
        require(takerAssetFillAmount > 0, "INVALID_TAKER_FILL_ASSET_AMOUNT");
        // Check if outcome is valid
        bool validOutcome;
        for(uint8 i = 0; i < market.getMarketOutcomeCount(marketId); i++) {
            if(market.getMarketOutcomeAtIndex(marketId, i) == outcome)
                validOutcome = true;
        }
        // Outcome must be valid
        require(validOutcome, "INVALID_OUTCOME");

        // Maker asset token must be DBET
        require(order.makerAssetData.readAddress(16) == address(token), "INVALID_MAKER_ASSET_TOKEN");

        // For eg. with a bid of 0.1 for 100 longs of outcome A by the maker,
        // Maker asset amount would be set at 10 DBETs, taker asset amount would be set at 100 long outcome share tokens

        // Contract would check whether maker has and has approved makerAssetAmount (10) DBETs
        require(token.balanceOf(order.makerAddress) >= order.makerAssetAmount, "INVALID_MAKER_TOKEN_BALANCE");
        require(token.allowance(order.makerAddress, address(this)) >= order.makerAssetAmount, "INVALID_MAKER_TOKEN_ALLOWANCE");

        // Contract would then check whether taker has (takerAssetFillAmount - makerAssetAmount) DBETs
        // and has approved (takerAssetFillAmount) DBETs
        // which would be a min. balance of (100 - 10) DBETs or 90 DBETs and allowance of 100 DBETs
        uint256 takerTokenRequirement = takerAssetFillAmount - order.makerAssetAmount;
        require(token.balanceOf(takerAddress) >= takerTokenRequirement, "INVALID_TAKER_TOKEN_BALANCE");
        require(token.allowance(takerAddress, address(this)) >= takerAssetFillAmount, "INVALID_TAKER_TOKEN_ALLOWANCE");

        return true;
    }

    /**
    * Assert that fill order parameters are valid
    * @param longShareToken address of long share token
    * @param shortShareToken address of short share token
    * @param isLong is order filling a long or short position
    * @param order Order struct containing order specifications.
    * @param takerAssetFillAmount Desired amount of takerAsset to sell.
    * @param salt Arbitrary value to guarantee uniqueness of 0x transaction hash.
    * @param makerSignature Proof that order has been created by maker.
    * @param takerSignature Proof that taker wishes to call this function with given params.
    * @return whether fill order was successful
    */
    function fillOrderInternal(
        address longShareToken,
        address shortShareToken,
        bool isLong,
        LibOrder.Order memory order,
        uint256 takerAssetFillAmount,
        uint256 salt,
        bytes memory makerSignature,
        bytes memory takerSignature
    )
    internal
    returns (bool) {
        address takerAddress = msg.sender;
        // Contract would mint takerAssetFillAmount (100) long share tokens (assuming maker is long) for the taker.
        // This would later be transferred to the taker using dispatchTransferFrom()

        // Maker - 10 DBETs, 0 longs, 0 shorts
        // Taker - 90 DBETs, 100 longs, 0 shorts
        require(
            OutcomeShareToken(
                isLong ? longShareToken : shortShareToken
            ).mint(
                takerAddress,
                takerAssetFillAmount
            )
        );

        // Contract would execute the 0x transaction for 100 longs and 10 DBETs between maker and taker
        // Maker would now have 100 longs and taker would have 10 DBETs (for a total of 100 transferable DBETs)
        // Encode arguments into byte array.
        bytes memory data = abi.encodeWithSelector(
            EXCHANGE.fillOrder.selector,
            order,
            takerAssetFillAmount,
            makerSignature
        );

        // Call `fillOrder` via `executeTransaction`.
        // Maker - 0 DBETs, 100 longs, 0 shorts
        // Taker - 100 DBETs, 0 longs, 0 shorts
        EXCHANGE.executeTransaction(
            salt,
            takerAddress,
            data,
            takerSignature
        );

        // Contract would transfer takerAssetFillAmount (100) DBETs from taker to contract as an escrow
        // Maker - 0 DBETs, 100 longs, 0 shorts
        // Taker - 0 DBETs, 0 longs, 0 shorts
        require(
            token.transferFrom(
                takerAddress,
                address(this),
                takerAssetFillAmount
            )
        );

        // Contract would mint takerAssetFillAmount short share tokens (assuming maker is long) for the taker
        // Maker - 0 DBETs, 100 longs, 0 shorts
        // Taker - 0 DBETs, 0 longs, 100 shorts
        require(
            OutcomeShareToken(
                isLong ? shortShareToken : longShareToken
            ).mint(
                takerAddress,
                takerAssetFillAmount
            )
        );

        // Maker would have 100 long share tokens, taker would have 100 short share tokens and contract would have 100 DBETs escrow-ed
        return true;
    }

    /// @dev Synchronously executes multiple calls of fillOrder.
    /// @param marketId ID of betting market
    /// @param outcome Outcome being bet on
    /// @param isLong is order filling a long or short position
    /// @param orders Array of order specifications.
    /// @param takerAssetFillAmounts Array of desired amounts of takerAsset to sell in orders.
    /// @param salts Arbitrary values to guarantee uniqueness of 0x transaction hashes.
    /// @param makerSignatures Proofs that order has been created by maker.
    /// @param takerSignatures Proofs that taker wishes to call this function with given params.
    /// @return bool Whether order fills were successful
    function batchFillOrders(
        bytes32 marketId,
        bytes32 outcome,
        bool isLong,
        LibOrder.Order[] memory orders,
        uint256[] memory takerAssetFillAmounts,
        uint256[] memory salts,
        bytes[] memory makerSignatures,
        bytes[] memory takerSignatures
    )
    public
    returns (bool)
    {
        for (uint256 i = 0; i != orders.length; i++) {
            fillOrder(
                marketId,
                outcome,
                isLong,
                orders[i],
                takerAssetFillAmounts[i],
                salts[i],
                makerSignatures[i],
                takerSignatures[i]
            );
        }
        return true;
    }

    /**
    * Redeems favorable outcome share tokens owned by a user for a market
    * @param marketId Market ID
    * @param outcome Market outcome
    * @param user User address
    * @return Whether redemption was successful
    */
    function redeemFavorableOutcomeShareTokens(
        bytes32 marketId,
        bytes32 outcome,
        address user
    )
    public
    returns (bool) {
        // Only the market contract can call this function
        require(msg.sender == address(market), "INVALID_SENDER");
        // Call the redeem function for the outcome share token
        bytes32 winningOutcome;
        (,,,,,winningOutcome) = market.getMarketInfo(marketId);
        uint256 favorableOutcomeShareTokenBalance = market.getMarketOutcomeShareTokenBalance(
            marketId,
            user,
            outcome,
            outcome == winningOutcome ? SHARE_LONG : SHARE_SHORT
        );
        uint256 profitPerFavorableOutcomeShareToken =
            market.calculateProfitPerFavorableOutcomeShareToken(
                marketId
            );
        uint256 totalDbetsToTransfer =
            favorableOutcomeShareTokenBalance.mul(profitPerFavorableOutcomeShareToken);

        // Burns user's token balance
        require(
            OutcomeShareToken(market.getMarketOutcomeShareToken(
                marketId,
                outcome,
                outcome == winningOutcome ? SHARE_LONG : SHARE_SHORT
            )).redeem(
                user
            ),
            "OUTCOME_SHARE_TOKEN_REDEEM_FAIL"
        );
        // Transfer DBETs equivalent to outcome share token balance + profit
        require(
            token.transfer(
                user,
                totalDbetsToTransfer
            ),
            "TOKEN_TRANSFER_FAIL"
        );
        // Emit redeem event
        emit LogRedeemOutcomeShareTokens(
            marketId,
            outcome,
            user
        );

        return true;
    }

    /**
    * Returns outcome share token balance for a user
    * @param outcomeShareToken Address of outcome share token
    * @param user User address
    * @return Outcome share token balance
    */
    function getOutcomeShareTokenBalanceOf(
        address outcomeShareToken,
        address user
    )
    public
    view
    returns (uint256) {
        return ERC20(outcomeShareToken).balanceOf(user);
    }
}
