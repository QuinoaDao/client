import {ethers, BigNumber} from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import router_abi from "../abis/core/Router.sol/Router.json"
import ERC20_abi from "../abis/token/interfaces/ERC20.json"
import testToken_abi from "../abis/token/TestToken.sol/TestToken.json"
import { text } from 'stream/consumers';

export const useBuy = (amount:string, address:any, assetAddress:any, currentAddress:any, tokenId?:BigNumber) => {
    const {ethereum} =window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = useMemo(()=>provider?.getSigner(), [provider]);
    const [txStatus, setTxStatus] = useState<string>("default");

    const buy = useCallback(
        async(amount:string, currentAddress:any, address:any, assetAddress:string, ) => {

            const routerAddress:string = process.env.REACT_APP_ROUTER_ADDRESS || ""
            const router = new ethers.Contract(routerAddress, router_abi.abi, signer);
            
            //**Testtoken minting just for testing **
            //const testToken = new ethers.Contract(assetAddress, testToken_abi.abi, signer);
            try{
                // const mintTx = await testToken.mint(currentAddress, ethers.utils.parseUnits("100"));
                // console.log(mintTx);
                // await mintTx.wait();
                // console.log("token Minted");

                const asset = new ethers.Contract(assetAddress, ERC20_abi.abi, signer);
                const approveTx = await asset.approve(router.address, ethers.utils.parseUnits(amount));
                setTxStatus(approveTx.blockHash === null ? "pending" : "error");
                await approveTx.wait();
                if(!!tokenId) // 추가 구매
                {
                    const buyTx = await router['buy(uint256,uint256)'](ethers.utils.parseUnits(amount), tokenId);
                    const receipt = await buyTx.wait();
                    console.log("buy!");
                    setTxStatus(!!receipt.blockHash ? "success" : "error" );
                }else { // 새롭게 구매
                    const buyTx = await router['buy(address,uint256)'](address, ethers.utils.parseUnits(amount));
                    const receipt = await buyTx.wait();
                    console.log("buy!");
                    setTxStatus(!!receipt.blockHash ? "success" : "error" );
                
                }
                

            } catch(e) {
                console.log(e);
                setTxStatus("error");
            }

        }, [amount, address, assetAddress, currentAddress, tokenId]);

    useEffect(()=>{
        if(txStatus === "error"){
            setTimeout(()=>{
                setTxStatus("default")
               }, 8000)
        }
        else if (txStatus === "success"){
            setTimeout(()=>{
                setTxStatus("default")
               }, 4000)
        }
    },[txStatus]);
    return {buy, txStatus};
};