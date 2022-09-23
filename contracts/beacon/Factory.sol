// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface Implementation {
    function initialize() external;
}

pragma solidity ^0.8.0;

contract Factory is Ownable {
    address public master;
    event NewBeacon(address indexed contractAddress);

    using Clones for address;

    constructor(address _master) {
        master = _master;
    }

    function createBeacon() external payable {
        address result = master.clone();
        Implementation(result).initialize();
        emit NewBeacon(result);
    }

    function holis() external pure returns (string memory){
        return "holis";
    }
}
