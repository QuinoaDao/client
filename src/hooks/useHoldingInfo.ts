import { useState, useEffect } from "react";
import { NftInfo } from "../models/NftInfo"
import {ethers, utils} from 'ethers';
import router_abi from "../abis/core/Router.sol/Router.json"
import ERC20_abi from "../abis/token/interfaces/ERC20.json"
import vaultFactory_abi from "../abis/core/VaultFactory.sol/VaultFactory.json"
import {BigNumber} from 'ethers';
import { HoldingInfo } from "../models/HolindgInfo";
import { getEmitHelpers } from "typescript";
import { PriceConversion } from "../utils/PriceConversion";

export const useHoldingInfo = (currentAddress:string) => {
    const [holdingInfo, setHoldingInfo] = useState<HoldingInfo>();
    const {ethereum} = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const getHoldingInfo = async(currentAddress:string) => {

        const vaultFactoryAddress :string = process.env.REACT_APP_VAULT_FACTORY_ADDRESS || "";
        const vaultFactory = new ethers.Contract(
            vaultFactoryAddress,
            vaultFactory_abi.abi,
            provider);
        const vaultList = await vaultFactory.getVault();

        const routerAddress = process.env.REACT_APP_ROUTER_ADDRESS || "";
        const router =  new ethers.Contract(routerAddress, router_abi.abi, signer);;
        let totalHoldings = 0;
        for(let i =0; i<vaultList.length; i++) {
            const {asset,amount} = await router.getHoldingAssetAmount(vaultList[i]);
            const tokenAmount = Number(ethers.utils.formatEther(amount));
            const baseAsset = new ethers.Contract(asset, ERC20_abi.abi, provider);
            const symbol = await baseAsset.symbol();

            // TODO: asset 의 달러 값 불러오기 (using coinmarketcap api). 없으면 1달러라 가정.
            const amountInDollar = await PriceConversion(symbol, tokenAmount);
            totalHoldings += amountInDollar;
        }
        const qui = new ethers.Contract(process.env.REACT_APP_QUI_ADDRESS||"", ERC20_abi.abi, provider);
        const quiTokens = Number(ethers.utils.formatEther(await qui.balanceOf(currentAddress)));
        setHoldingInfo({totalHoldings, quiTokens});
        
    }

    useEffect(()=> {
        getHoldingInfo(currentAddress);
    }, [currentAddress])
    return holdingInfo;
}