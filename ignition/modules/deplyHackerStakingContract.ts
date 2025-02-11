// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const hackerboostStakingModule = buildModule("HackerStakingContractModule", (m) => {

  const hackerStakingContract = m.contract("HackerStakingContract");

  return { hackerStakingContract };
});

export default hackerboostStakingModule;
