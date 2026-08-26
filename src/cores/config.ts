import { ccc } from "@ckb-ccc/connector-react";
import { Cell, Transaction, helpers } from "@ckb-lumos/lumos";
import { ChainConfig, chainConfigFrom, I8Script, lockExpanderFrom, i8ScriptPadding } from "@ickb/lumos-utils";
import { getIckbScriptConfigs } from "@ickb/v1-core";
import type { QueryClient } from "@tanstack/react-query"

// Some bundled dependencies capture a detached reference to `fetch` and later
// invoke it without `window` as the receiver, which throws
// "Failed to execute 'fetch' on 'Window': Illegal invocation" in the browser.
// Re-binding `window.fetch` to `window` makes it safe to call regardless of
// how the reference is later invoked.
if (typeof window !== "undefined" && typeof window.fetch === "function") {
    window.fetch = window.fetch.bind(window);
}

export interface WalletConfig extends ChainConfig {
    address: ccc.Hex;
    client: ccc.Client;
    accountLock: I8Script;
    expander: (c: Cell) => I8Script | undefined;
    addPlaceholders: (tx: helpers.TransactionSkeletonType) => helpers.TransactionSkeletonType;
    signer: (tx: helpers.TransactionSkeletonType) => Promise<Transaction>;
    queryClient: QueryClient;
}

let WalletConfig: WalletConfig | undefined = undefined;

const chain2RpcUrl = Object.freeze({
  mainnet: "https://mainnet.ckb.dev",
  testnet: "https://testnet.ckb.dev",
  devnet: "http://127.0.0.1:8114/",
});

export async function setupWalletConfig(signer: ccc.Signer,queryClient: QueryClient) {
    const chain = signer.client.addressPrefix === "ckb" ? "mainnet" : "testnet";
    const chainConfig = await chainConfigFrom(chain, chain2RpcUrl[chain], true, getIckbScriptConfigs);
    const addresses = await signer.getAddressObjs();
    let signerAddress = addresses[0];
    for (const address of addresses) {
        const balance = await signer.client.getBalance([address.script]);
        if (balance > 0) {
            signerAddress = address;
            break;
        }
    }
    const signerLock = I8Script.from({
        ...i8ScriptPadding,
        ...signerAddress.script,

    });
   
    WalletConfig = {
        ...chainConfig,
        client: signer.client,
         // @ts-expect-error '0xstring&&string'
        address: signerAddress.toString(),
        accountLock: signerLock,
        expander: lockExpanderFrom(signerLock),
        addPlaceholders: (tx: helpers.TransactionSkeletonType) => tx,
         // @ts-expect-error '0xstring&&string'
        signer: async (tx: helpers.TransactionSkeletonType) => {
            const cccTx = ccc.Transaction.fromLumosSkeleton(tx);
            return await signer.signTransaction(cccTx);
        },
        queryClient:queryClient
    }
    return WalletConfig
}

export function getWalletConfig(): WalletConfig {
    if (!WalletConfig) {
        
        throw new Error("please call `setupWalletConfig` at first");
    }
    return WalletConfig;
}
