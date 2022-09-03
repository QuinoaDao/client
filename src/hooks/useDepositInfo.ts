import { useState, useEffect } from "react";
import router_abi from "../abis/core/Router.sol/Router.json"
import nftRouter_abi from "../abis/core/NftWrappingManager.sol/NftWrappingManager.json"
import {ethers} from 'ethers';
import {BigNumber} from 'ethers';

export const useDepositInfo = (currentAddress:string, vaultAddress:string) => {
    const [deposit, setDeposit] = useState<number>(0);
    const {ethereum} = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const routerAddress = process.env.REACT_APP_ROUTER_ADDRESS || "";
    const router = new ethers.Contract(routerAddress, router_abi.abi, signer);

    const nftManager = new ethers.Contract(
        process.env.REACT_NFT_MANAGER_ADDRESS|| "", 
        nftRouter_abi.abi,
        provider);
    
    const getDepositInfo = async() => {
        const nftList: BigNumber[] = await router.getNfts(vaultAddress);
        console.log(nftList);
        const depositAmount = await nftManager.getQtokenAmount(nftList[0]);
        // for(let i=0; i<nftList.length; i++) {
        //     console.log("qvtoken : ",Number(await nftManager.getQtokenAmount(nftList[i])));
        // }
        console.log(depositAmount);
        setDeposit(Number(depositAmount));
    }

    useEffect(()=> {
        getDepositInfo();
    }, [vaultAddress])
    // string
    return deposit;

}