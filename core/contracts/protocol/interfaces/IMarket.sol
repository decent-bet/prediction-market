pragma solidity 0.5.0;

import "../libs/LibMarket.sol";

contract IMarket {

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
    ) public returns (bytes32);

    /**
    * Resolves a market with a winning outcome
    * @param id Market ID
    * @param outcome Winning outcome
    * @return whether market resolution was successful
    */
    function resolveMarket(
        bytes32 id,
        bytes32 outcome
    ) public returns (bool);

    /**
    * Redeems favorable outcome shares (long winning outcome/short losing outcome(s)) for a closed market
    * @param marketId Market ID
    * @return Total number of redeemed outcome shares
    */
    function redeemFavorableOutcomeShares(
        bytes32 marketId
    )
    public
    returns (uint256);

    /**
    * Adds an admin to the market contract
    * @param _address Address to add as admin
    * @return whether admin was added
    */
    function addAdmin(
        address _address
    ) public returns (bool);

    /**
    * Removes an admin from the market contract
    * @param _address Address of admin
    * @return whether admin was removed
    */
    function removeAdmin(
        address _address
    ) public returns (bool);

}
