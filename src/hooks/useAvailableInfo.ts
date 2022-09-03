import { AvailableInfo } from "../models/AvailableInfo"
import { useEffect, useState } from "react";
import {ethers, utils} from 'ethers';
import { VaultInfo } from "../models/VaultInfo";
import router_abi from "../abis/core/Router.sol/Router.json"
import ERC20_abi from "../abis/token/interfaces/ERC20.json"


export const useAvailableInfo = (currentAddress:string, vaultInfo: VaultInfo) => {
    const [available, setAvailable] = useState<AvailableInfo>();
    const {ethereum} = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const getAvailableInfo = async(currentAddress:string, vaultInfo: VaultInfo) => {
        const routerAddress = process.env.REACT_APP_ROUTER_ADDRESS || "";
        const router = new ethers.Contract(routerAddress, router_abi.abi, signer);
        const {asset, amount} = await router.getHoldingAssetAmount(vaultInfo.address);
        
        const baseAsset = new ethers.Contract(asset, ERC20_abi.abi, provider);
        const balance = await baseAsset.balanceOf(currentAddress);

        setAvailable({availableSaleAmount:Number(ethers.utils.formatEther(amount)), 
            availableBuyAmount: Number(ethers.utils.formatEther(balance))});
        
    }
    useEffect(() => {
        getAvailableInfo(currentAddress, vaultInfo);
    }, [currentAddress, vaultInfo]);
    return available;

    
}