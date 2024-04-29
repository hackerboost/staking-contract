// SPDX-License-Identifier: MIT
// Indicates that the code is licensed under the MIT License.
pragma solidity ^0.8.24; // Specifies the version of Solidity to be used.

contract Staking { // Declares the start of the Staking contract.
    address public owner; // Declares a public state variable to store the address of the contract owner.

    struct Position { // Defines a custom data structure called Position.
        uint PositionId; // Identifier for a staking position.
        address walletAddress; // Address of the wallet that created the position.
        uint createdDate; // Timestamp of when the position was created.
        uint unlockDate; // Timestamp of when the staked funds can be withdrawn.
        uint percentInterest; // Interest rate for the staked amount, in basis points.
        uint weiStaked; // Amount of Ether staked in wei.
        uint weiInterest; // Interest earned on the staked amount in wei.
        bool open; // Flag indicating whether the position is open or closed.
    }

    Position position; // Declares a variable of type Position.

    uint public currentPositionId; // Declares a public state variable to store the current position ID counter.
    mapping(uint => Position) public positions; // Maps position IDs to Position structs.
    mapping(address => uint[]) public positionIdsByAddress; // Maps wallet addresses to arrays of position IDs.
    mapping(uint => uint) public tiers; // Maps lock periods (in days) to interest rates in basis points.
    uint[] public lockPeriods; // Array to store available lock periods.

    constructor() payable { // Constructor function, executed once during contract deployment.
        owner = msg.sender; // Sets the contract deployer's address as the owner.
        currentPositionId = 0; // Initializes the current position ID counter.

        // Initializes lock periods and corresponding interest rates.
        tiers[0] = 700; // 700 basis points (7.00%) interest for 0-day lock period.
        tiers[30] = 800; // 800 basis points (8.00%) interest for 30-day lock period.
        tiers[60] = 900; // 900 basis points (9.00%) interest for 60-day lock period.
        tiers[90] = 1200; // 1200 basis points (12.00%) interest for 90-day lock period.

        // Populates the array with available lock periods.
        lockPeriods.push(0); // Adds 0-day lock period.
        lockPeriods.push(30); // Adds 30-day lock period.
        lockPeriods.push(60); // Adds 60-day lock period.
        lockPeriods.push(90); // Adds 90-day lock period.
    }

    function stakeEther(uint numDays) external payable { // Function to stake Ether for a specified number of days.
        require(tiers[numDays] > 0, "Mapping Not Found"); // Requires that the interest rate for the specified lock period exists.

        // Creates a new Position and adds it to the positions mapping.
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

        // Adds the position ID to the array of position IDs for the user.
        positionIdsByAddress[msg.sender].push(currentPositionId);
        currentPositionId += 1; // Increments the position ID counter.
    }

    function calculateInterest(uint basisPoints, uint weiAmount) private pure returns(uint) { // Private function to calculate interest.
        return basisPoints * weiAmount / 10000; // Calculates interest using the provided basis points and staked amount.
    }

    function getLockPeriods() external view returns(uint[] memory) { // Function to retrieve available lock periods.
        return lockPeriods; // Returns the array of available lock periods.
    }

    function getInterestRate(uint numDays) external view returns(uint) { // Function to retrieve the interest rate for a specified lock period.
        return tiers[numDays]; // Returns the interest rate corresponding to the provided lock period.
    }

    function getPositionById(uint PositionId) external view returns(Position memory) { // Function to retrieve position details by ID.
        return positions[PositionId]; // Returns the Position struct corresponding to the provided position ID.
    }

    function getPositionIdsForAddress(address walletAddress) external view returns(uint[] memory) { // Function to retrieve position IDs for a given wallet address.
        return positionIdsByAddress[walletAddress]; // Returns the array of position IDs associated with the provided wallet address.
    }

    function closePosition(uint PositionId) external { // Function to close a position and withdraw funds.
        require(positions[PositionId].walletAddress == msg.sender, "Only position creator can modify position"); // Requires that only the position creator can close the position.
        require(positions[PositionId].open == true, "Position is closed"); // Requires that the position is open.

        positions[PositionId].open = false; // Sets the position status to closed.

        // Calculates the total amount to be transferred to the position creator (staked amount + interest).
        uint amount = positions[PositionId].weiStaked + positions[PositionId].weiInterest;
        (bool success, ) = payable(msg.sender).call{value: amount}(""); // Attempts to transfer the funds to the position creator.
        require(success, "Transfer failed"); // Requires that the transfer is successful.
    } 
}