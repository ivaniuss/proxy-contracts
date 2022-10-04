// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract MyToken is Initializable, ERC721Upgradeable, OwnableUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _owner) initializer public {
        __ERC721_init("MyToken", "MTK");
        __Ownable_init();
        transferOwnership(_owner);
    }
}


contract MyToken2 is Initializable, ERC721Upgradeable, OwnableUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _owner) initializer public {
        __ERC721_init("MyToken", "MTK");
        __Ownable_init();
        transferOwnership(_owner);
    }

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
}


contract NFTBeacon is Ownable {
    UpgradeableBeacon immutable beacon;

    address public blueprint;

    constructor(address _initBlueprint) {
        beacon = new UpgradeableBeacon(_initBlueprint);
        blueprint = _initBlueprint;
        transferOwnership(tx.origin);
    }

    function update(address _newBlueprint) public onlyOwner {
        beacon.upgradeTo(_newBlueprint);
        blueprint = _newBlueprint;
    }

    function implementation() public view returns (address){
        return beacon.implementation();
    }
}




contract NFTFactory is Ownable{
    mapping(uint32 => address) private ships;
    NFTBeacon immutable beacon;

    constructor(address _initBlueprint) {
        beacon = new NFTBeacon(_initBlueprint);
    }

    function buildShip(uint32 shipId) public onlyOwner {
        BeaconProxy ship = new BeaconProxy(
            address(beacon),
            abi.encodeWithSelector(MyToken(address(0)).initialize.selector, msg.sender)
        );
        transferOwnership(msg.sender);
        ships[shipId] = address(ship);
    }

    function getShipAddress(uint32 shipId) external view returns (address) {
        return ships[shipId];
    }

    function getBeacon() public view returns (address) {
        return address(beacon);
    }

    function getImplementation() public view returns (address) {
        return beacon.implementation();
    }
}

