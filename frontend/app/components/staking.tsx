import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../styles/Home.module.css";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

import { CONTRACT_ADDRESS, ABI } from "../contracts/index";

export default function Staking() {
  const { isConnected, address } = useAccount();
  const [contract, setContract] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState("");
  const [stakingTab, setStakingTab] = useState(true);
  const [unstakingTab, setUnstakingTab] = useState(false);
  const [unstakeValue, setUnstakeValue] = useState(0);
  const [assetIds, setAssetIds] = useState<number[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [amount, setAmount] = useState<string | number>("");

  const toWei = (ether: string) => ethers.parseEther(ether);
  const toEther = (wei: ethers.BigNumberish) => ethers.formatEther(wei);

  useEffect(() => {
    async function initialize() {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractIns = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        setContract(contractIns);
        setSigner(signer);
      }
    }
    if (isConnected) {
      initialize();
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      getWalletBalance();
    }
  }, [isConnected]);

  const getWalletBalance = async () => {
    if (!signer) return;
    const balance = await signer.getBalance();
    setWalletBalance(toEther(balance));
  };

  const switchToUnstake = async () => {
    if (!unstakingTab) {
      setUnstakingTab(true);
      setStakingTab(false);
      if (address) {
        const assetIds = await getAssetIds(address);
        setAssetIds(assetIds);
        getAssets(assetIds);
      }
      setAssetIds(assetIds);
      getAssets(assetIds);
    }
  };

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

  const getAssetIds = async (address: string): Promise<number[]> => {
    if (!contract) return [];
    return await contract.getPositionIdsForAddress(address);
  };

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

  const getAssets = async (ids: number[]): Promise<void> => {
    if (!contract) return;
    const queriedAssets: RawAsset[] = await Promise.all(ids.map((id) => contract.getPositionById(id)));
    const parsedAssets: Asset[] = queriedAssets.map((asset) => ({
      positionId: asset.positionId,
      percentInterest: Number(asset.percentInterest) / 100,
      daysRemaining: calcDaysRemaining(Number(asset.unlockDate)),
      etherInterest: toEther(asset.weiInterest),
      etherStaked: toEther(asset.weiStaked),
      open: asset.open,
    }));
    setAssets(parsedAssets);
  };

  const stakeEther = async ({ stakingLength }: any): Promise<void> => {
    if (!contract) return;
    const wei = toWei(String(amount));
    const tx = await contract.stakeEther(stakingLength, { value: wei });
    await tx.wait();
  };

  const withdraw = async (positionId: number) => {
    if (!contract) return;
    const tx = await contract.closePosition(positionId);
    await tx.wait();
  };

  return (
    <section className={styles.stakingContainer}>
      <section>
        <section className={styles.stakeUnstakeTab}>
          <section className={`${stakingTab ? styles.stakingType : ""}`} id="stake" onClick={switchToStake}>
            Stake
          </section>
          <section className={`${unstakingTab ? styles.stakingType : ""}`} id="unstake" onClick={switchToUnstake}>
            Unstake
          </section>
        </section>
        <section className={styles.stakingSection}>
          <span className={styles.apy}>7% APY</span>
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
              <button className={styles.stakeBtn} onClick={() => stakeEther(0)}>STAKE</button>
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
              <button className={styles.stakeBtn} onClick={() => assets.length > 0 && withdraw(assets[assets.length - 1].positionId)}>UNSTAKE</button>
            </section>
          )}
        </section>
      </section>
    </section>
  );
}