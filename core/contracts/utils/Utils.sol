pragma solidity 0.5.0;


// Utility functions used by contracts on the decent.bet platform
contract Utils {

    function bytes32ToBool(bytes32 b)
    public
    pure
    returns (bool) {
        if ((uint)(b) == 0)
            return false;
        else if ((uint)(b) == 1)
            return true;
        else
            revert();
    }

    function bytes32ToString(bytes32 x)
    public
    pure
    returns (string memory) {
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (uint j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    }

    function boolToString(bool b)
    public
    pure
    returns (string memory) {
        if (b == true)
            return "true";
        else if (b == false)
            return "false";
    }

}