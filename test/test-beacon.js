const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Beacon", function () {
  it("deployments", async ()=> {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    const BeaconProxyPatternV1 = await ethers.getContractFactory("BeaconProxyPatternV1");
    const beacon = await upgrades.deployBeacon(BeaconProxyPatternV1, {unsafeAllow: ['constructor']});
    await beacon.deployed();
    console.log(`Beacon with Beacon Proxy Pattern V1 as implementation is deployed to address: ${beacon.address}`);

    const beaconProxy1 = await upgrades.deployBeaconProxy(beacon.address, BeaconProxyPatternV1, []);
    let versionAwareContractName = await beaconProxy1.getContractNameWithVersion();
    expect(versionAwareContractName).to.eq("Beacon Proxy Pattern: V1");
    
    const beaconProxy2 = await upgrades.deployBeaconProxy(beacon.address, BeaconProxyPatternV1, []);
    versionAwareContractName = await beaconProxy2.getContractNameWithVersion();
    expect(versionAwareContractName).to.eq("Beacon Proxy Pattern: V1");
    
    const BeaconProxyPatternV2 = await ethers.getContractFactory("BeaconProxyPatternV2");
    const upgradedBeacon = await upgrades.upgradeBeacon(beacon.address, BeaconProxyPatternV2, {unsafeAllow: ['constructor']});
    console.log(`Beacon upgraded with Beacon Proxy Pattern V2 as implementation at address: ${upgradedBeacon.address}`);
    versionAwareContractName = await beaconProxy1.getContractNameWithVersion();
    expect(versionAwareContractName).to.eq("Beacon Proxy Pattern: V2");

    versionAwareContractName = await beaconProxy2.getContractNameWithVersion();
    console.log(`Proxy Pattern and Version from Proxy 2 Implementation: ${versionAwareContractName}`);
    versionAwareContractName = await beaconProxy1.versionAwareContractName();
    console.log(`Proxy Pattern and Version from Proxy 1 Storage: ${versionAwareContractName}`);
    versionAwareContractName = await beaconProxy2.versionAwareContractName();
    console.log(`Proxy Pattern and Version from Proxy 2 Storage: ${versionAwareContractName}`);
    
    const implementationAddress =  await beacon.implementation();
    
    const Factory = await ethers.getContractFactory("Factory");
    const factory = await Factory.deploy(implementationAddress);
    await factory.deployed();


    const tx1 = await factory.createBeacon();
    const addr = await tx1.wait()
    const newBeacon = new ethers.Contract(
      addr.events[1].args.contractAddress,
      [
        'function getContractNameWithVersion() public pure override returns (string memory)',
      ],
      addr1
    );
    expect(newBeacon.address).to.equal(addr.events[1].args.contractAddress)

    console.log('version', await newBeacon.getContractNameWithVersion())

  })

});
