const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Beacon", function () {
  it.only("ship beacon", async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    const ship = await (await ethers.getContractFactory("Ship")).deploy();
    const shipFactory = await (await ethers.getContractFactory("ShipFactory")).deploy(ship.address);
    const beacon = await shipFactory.getBeacon();
    const shipBeacon = await (await ethers.getContractFactory("ShipBeacon"))
                        .attach(beacon);
    
    await shipFactory.buildShip("ship1", 10, 1);
    await shipFactory.buildShip("ship2", 1, 2);

    const shipV2 = await (await ethers.getContractFactory("ShipV2")).deploy();
    await shipBeacon.update(shipV2.address);

    const shipIndex = await shipFactory.getShipAddress(1);
    const updatedShip = await (await ethers.getContractFactory("ShipV2"))
                        .attach(shipIndex);
    await await updatedShip.refuel();
    expect(await updatedShip.fuel()).to.be.eq(11);

    const shipIndex2 = await shipFactory.getShipAddress(2);
    const updatedShip2 = await (await ethers.getContractFactory("ShipV2"))
        .attach(shipIndex2);
    await await updatedShip2.refuel();
    expect(await updatedShip2.fuel()).to.be.eq(2);
  })

});
