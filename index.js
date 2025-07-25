require("dotenv").config();
const { ethers } = require("ethers");
const { encodeSwapBridgeMeta } = require("./utils/encodePayload");

// Load ENV
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const routerAddress = process.env.ROUTER_CONTRACT;

// --- METADATA (replace if dynamic)
const meta = {
    asset_in_type: "native",
    releases: [
        {
            dex: "euclid",
            release_address: [
                {
                    chain_uid: "arbitrum",
                    address: "0x2811925864db0a24b711453bbf4b1383706ea87b",
                    amount: "9201964536030220"
                }
            ],
            token: "eth",
            amount: ""
        }
    ],
    swaps: {
        path: [
            {
                route: ["plume", "euclid", "eth"],
                dex: "euclid",
                chain_uid: "plume",  // fix jika salah
                amount_in: "1000000000000000000",
                amount_out: "9201964536030220"
            }
        ]
    }
};

async function main() {
    console.log("[*] Preparing transaction...");

    const encodedData = encodeSwapBridgeMeta(JSON.stringify(meta));
    const tx = {
        to: routerAddress,
        data: encodedData,
        value: ethers.utils.parseEther("1.0"), // 1 ETH
        gasLimit: 1_000_000
    };

    const sentTx = await wallet.sendTransaction(tx);
    console.log("✅ Tx sent:", sentTx.hash);

    const receipt = await sentTx.wait();
    console.log("📦 Tx confirmed in block", receipt.blockNumber);
}

main().catch(console.error);
