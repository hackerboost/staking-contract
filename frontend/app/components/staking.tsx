import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../styles/Home.module.css";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

import { CONTRACT_ADDRESS, ABI } from "../contractData/index";

export default function Staking() {
  const { isConnected, address } = useAccount();

  const [walletBalance, setWalletBalance] = useState("");
  const [stakingTab, setStakingTab] = useState(true);
  const [unstakingTab, setUnstakingTab] = useState(false);
  const [unstakeValue, setUnstakeValue] = useState<string | number>("");
  const [assetIds, setAssetIds] = useState<number[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [amount, setAmount] = useState<string | number>("");
  const [stakingLength, setStakingLength] = useState<number>(0);

  // Conversions
  const toWei = (ether: string) => ethers.parseEther(ether);
  const toEther = (wei: ethers.BigNumberish) => ethers.formatEther(wei);


// 🟢 LET'S BUILD

  // 👩🏻‍💻 1. LOAD CONTRACT DATA FROM BLOCKCHAIN ON ANY COMPONENT MOUNT
  // The first thing to do before you can interact with the contract!

  // 👩🏻‍💻 2. GET YOUR WALLET BALANCE

  // 👩🏻‍💻 3. CALL THE STAKING FUNCTION FROM YOUR CONTRACT
  const stakeEther = (stakingLength: number) => {};

  // 👩🏻‍💻 4. CALL THE WITHDRAWAL FUNCTION FROM YOUR CONTRACT
  const withdraw = (positionId: number) => {};

  // Function to switch to the Unstake tab
  const switchToUnstake = async () => {
    if (!unstakingTab) {
      setUnstakingTab(true);
      setStakingTab(false);

     // 🟠 UNCOMMENT IT

      // if (address) {
      //   const assetIds = await getAssetIds(address);
      //   setAssetIds(assetIds);
      //   getAssets(assetIds);
      // }
      // setAssetIds(assetIds);
      // getAssets(assetIds);
    }
  };

  // Function to switch to the Stake tab
  const switchToStake = () => {
    if (!stakingTab) {
      setStakingTab(true);
      setUnstakingTab(false);
    }
  };

  interface Asset {
    positionId: number;
    percentInterest: number;
    daysRemaining: number;
    etherInterest: string;
    etherStaked: string;
    open: boolean;
  }

  // 🔴 Function to get all position IDs for a user address (UNCOMMENT IT)

  // const getAssetIds = async (address: string): Promise<number[]> => {
  //   if (!contract) return [];
  //   return await contract.getPositionIdsForAddress(address);
  // };

  const calcDaysRemaining = (unlockDate: number): number => {
    const timeNow = Date.now() / 1000;
    const secondsRemaining = unlockDate - timeNow;
    return Math.max(Number((secondsRemaining / 60 / 60 / 24).toFixed(0)), 0);
  };

  interface RawAsset {
    positionId: number;
    percentInterest: ethers.BigNumberish;
    unlockDate: ethers.BigNumberish;
    weiInterest: ethers.BigNumberish;
    weiStaked: ethers.BigNumberish;
    open: boolean;
  }

  // 🔴 Function to get a position by an ID (UNCOMMENT IT)

  // const getAssets = async (ids: number[]): Promise<void> => {
  //   if (!contract) return;
  //   const queriedAssets: RawAsset[] = await Promise.all(
  //     ids.map((id) => contract.getPositionById(id))
  //   );

  //   const parsedAssets: Asset[] = queriedAssets.map((asset) => ({
  //     positionId: asset.positionId,
  //     percentInterest: Number(asset.percentInterest) / 100,
  //     daysRemaining: calcDaysRemaining(Number(asset.unlockDate)),
  //     etherInterest: toEther(asset.weiInterest),
  //     etherStaked: toEther(asset.weiStaked),
  //     open: asset.open,
  //   }));
  //   setAssets(parsedAssets);
  // };

  return (
    <section className={styles.stakingContainer}>
      <section className="w-full border dark:border-white border-black dark:border-opacity-15 border-opacity-15 rounded-2xl shadow-2xl bg-blue-950 dark:bg-slate-950 p-4 flex flex-col justify-center items-center">
        <section className={styles.stakeUnstakeTab}>
          <section
            className={`${stakingTab ? styles.stakingType : ""}`}
            id="stake"
            onClick={switchToStake}
          >
            Stake
          </section>
          <section
            className={`${unstakingTab ? styles.stakingType : ""}`}
            id="unstake"
            onClick={switchToUnstake}
          >
            Unstake
          </section>
        </section>
        <section className={styles.stakingSection}>
          <span className={styles.apy}>{stakingLength} DAYS</span>
          {stakingTab ? (
            <section className={styles.stakingBox}>
              <h2>Stake</h2>
              <input
                className={styles.inputField}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                type="number"
                id="inputField"
                maxLength={120}
                placeholder="Enter Amount"
                required
              />

              {/* Dropdown for selecting staking length */}
              <select
                className={styles.inputField}
                value={stakingLength}
                onChange={(e) => setStakingLength(Number(e.target.value))}
              >
                <option value="0">Flexible (0 Days) - 7% APY</option>
                <option value="30">Locked (30 Days) - 8% APY</option>
                <option value="60">Locked (60 Days) - 9% APY</option>
                <option value="90">Locked (90 Days) - 12% APY</option>
              </select>

              <section className={styles.stakingInfo}>
                <p>
                  Balance:{" "}
                  <span>
                    {(Number(walletBalance) / 10 ** 18).toLocaleString()}
                  </span>
                </p>
                <p>Exchange Rate: 1.03582967</p>
                {/* <p>Transaction Cost</p> */}
              </section>
              <button className={styles.stakeBtn} onClick={() => stakeEther(0)}>
                STAKE
              </button>
            </section>
          ) : (
            <section className={styles.stakingBox}>
              <h2>Unstake</h2>
              <input
                className={styles.inputField}
                value={unstakeValue}
                onChange={(e) => setUnstakeValue(Number(e.target.value))}
                type="number"
                id="inputField"
                maxLength={120}
                placeholder="Enter Amount"
                required
              />
              <section className={styles.stakingInfo}>
                <p className="flex flex-col">
                  <span>Positions: </span>
                  {assets.length > 0 &&
                    assets.map((a, id) => (
                      <span key={id}>{a.open ? a.etherStaked : ""}</span>
                    ))}
                </p>

                {/* <p>Transaction Cost</p> */}
                <p>
                  You Receive:{" "}
                  {unstakeValue == 0 ? "" : Number(unstakeValue) * 1.07}
                </p>
              </section>
              <button
                className={styles.stakeBtn}
                onClick={() =>
                  assets.length > 0 &&
                  withdraw(assets[assets.length - 1].positionId)
                }
              >
                UNSTAKE
              </button>
            </section>
          )}
        </section>
      </section>
    </section>
  );
}
