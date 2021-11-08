import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { RelayerParams } from 'defender-relay-client/lib/relayer';
import { ethers, utils } from 'ethers';

const { Contract } = ethers;
const { parseEther: toWei } = utils;

import * as ERC20Abi from './abis/ERC20.json';
import * as PodAbi from './abis/Pod.json';

import { daiAddresses, daiPodAddresses, usdcAddresses, usdcPodAddresses } from './Constants';

export async function handler(credentials: RelayerParams) {
  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, { speed: 'safeLow' });

  const networkName = (await provider._networkPromise).name;

  const dropDaiPod = async () => {
    const daiPodAddress = daiPodAddresses[networkName];
    const dai = new Contract(daiAddresses[networkName], ERC20Abi, provider);
    const daiPod = new Contract(daiPodAddress, PodAbi, signer);
    const daiBalance = await dai.callStatic.balanceOf(daiPodAddress);

    if (daiBalance > toWei('0')) {
      const tx = await daiPod.drop();
      console.log('Successfully deposited DAI into the prize pool!');
      console.log('Transaction hash: ', tx.hash);
    } else {
      console.log('No DAI tokens to deposit into the prize pool');
    }
  }

  const dropUsdcPod = async () => {
    const usdcPodAddress = usdcPodAddresses[networkName];
    const usdc = new Contract(usdcAddresses[networkName], ERC20Abi, provider);
    const usdcPod = new Contract(usdcPodAddress, PodAbi, signer);
    const usdcBalance = await usdc.callStatic.balanceOf(usdcPodAddress);

    if (usdcBalance > toWei('0')) {
      const tx = await usdcPod.drop();
      console.log('Successfully deposited USDC into the prize pool!');
      console.log('Transaction hash: ', tx.hash);
    } else {
      console.log('No USDC tokens to deposit into the prize pool');
    }
  }

  await Promise.all([
    dropDaiPod(),
    dropUsdcPod()
  ]);
}
