import { useState, useEffect } from "react";
import { NftInfo } from "../models/NftInfo"
import {ethers} from 'ethers';
import router_abi from "../abis/core/Router.sol/Router.json"
import vaultFactory_abi from "../abis/core/VaultFactory.sol/VaultFactory.json"
import vault_abi from "../abis/core/Vault.sol/Vault.json";
import nftManager_abi from "../abis/core/NftWrappingManager.sol/NftWrappingManager.json";
import {BigNumber} from 'ethers';
import { PriceConversion } from "../utils/PriceConversion";
import { VaultInfo } from "../models/VaultInfo";

export const useNftInfo = (currenctAccount:string) => {
    const [nfts, setNfts] = useState<NftInfo[]>([]);
    const {ethereum} = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const getNftList = async() => {
        if (nfts.length > 0 ) return
        const vaultFactoryAddress :string = process.env.REACT_APP_VAULT_FACTORY_ADDRESS || "";
        const vaultFactory = new ethers.Contract(
            vaultFactoryAddress,
            vaultFactory_abi.abi,
            provider);
        const vaultList = await vaultFactory.getVault();

        const routerAddress = process.env.REACT_APP_ROUTER_ADDRESS || "";
        const router = new ethers.Contract(
            routerAddress,
            router_abi.abi,
            signer);
        for(let i =0; i<vaultList.length; i++) {
            const tokenList: BigNumber[] = await router.getNfts(vaultList[i]);
            console.log (tokenList);
            const vault = new ethers.Contract(
                vaultList[i],
                vault_abi.abi,
                provider);
            const nftManager = new ethers.Contract(
                process.env.REACT_APP_NFT_MANAGER_ADDRESS || "",
                nftManager_abi.abi,
                provider);
            const [ , name, symbol, address, date, apy, totalVolume, dacName] = await vault.vaultInfo(); 
            const [totalAssets, asset] = await Promise.all([ vault.totalAssets(),  vault.asset()]);

            const info : NftInfo[] = await Promise.all(tokenList.map(async (item) => <NftInfo> {
                vaultInfo: {address, asset, name, symbol, totalAssets, totalVolume, dacName, date, apy},
                tokenId : item,
                nftSvg : await nftManager.tokenSvgUri(item),
                holding : await PriceConversion(
                    symbol,
                    Number(ethers.utils.formatEther(await nftManager.getQtokenAmount(item)))
                )
            }))
    
            setNfts((prev) => [...prev, ...info]);
            
        }
        console.log(nfts)
    }

    useEffect(()=> {
        getNftList();
    }, [])
    return nfts;
}