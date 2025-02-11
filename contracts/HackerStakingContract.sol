// SPDX-License-Identifier: MIT

pragma solidity ^0.8.27;

contract HackerStakingContract {
    address public owner;
    uint256 public currentPositionId;

    struct Position {
        uint256 positionId;
        address walletAddress;
        uint256 createdDate;
        uint256 unlockDate;
        uint256 percentInterest;
        uint256 weiStaked;
        uint256 weiInterest;
        bool open;
    }

    Position position;

    mapping(uint256 => Position) public positions;
    mapping(address => uint256[]) public addressToPositionIds;
    mapping(uint256 => uint256) public tiers;

    uint256[] public lockPeriods;

    constructor() payable {
        owner = msg.sender;
        currentPositionId = 0;

        tiers[0] = 700;
        tiers[30] = 800;
        tiers[60] = 900;
        tiers[90] = 1_200;

        lockPeriods.push(0);
        lockPeriods.push(30);
        lockPeriods.push(60);
        lockPeriods.push(90);
    }

    function stakeEther(uint256 numDays) external payable {
        require(tiers[numDays] > 0, "Mapping not found");

        positions[currentPositionId] = Position(
            currentPositionId,
            msg.sender,
            block.timestamp,
            block.timestamp + (numDays * 1 days),
            tiers[numDays],
            msg.value,
            calculateInterest(tiers[numDays], msg.value),
            true
        );

        addressToPositionIds[msg.sender].push(currentPositionId);
        currentPositionId += 1;
    }

    function calculateInterest(
        uint256 basisPoints,
        uint256 weiAmount
    ) private pure returns (uint256) {
        return (basisPoints * weiAmount) / 10_000;
    }

    function getLockPeriods() external view returns (uint256[] memory) {
        return lockPeriods;
    }

    function getInterestRate(uint256 numDays) external view returns (uint256) {
        return tiers[numDays];
    }

    function getPositionById(
        uint256 positionId
    ) external view returns (Position memory) {
        return positions[positionId];
    }

    function getPositionIdsForAddress(address walletAddress) external view returns (uint256[] memory) {
        return addressToPositionIds[walletAddress];
    }

    function closePosition(uint256 positionId) external {
        require(positions[positionId].walletAddress == msg.sender, "Only position owner can close position");
        require(positions[positionId].open == true, "Position is already closed");

        positions[positionId].open = false;

        uint256 amount = positions[positionId].weiStaked + positions[positionId].weiInterest;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }
}
