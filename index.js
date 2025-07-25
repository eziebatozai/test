require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  const rpcUrl = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const routerAddress = process.env.ROUTER_ADDRESS;

  if (!rpcUrl || !privateKey || !routerAddress) {
    console.error("❌ Missing .env variables. Please check RPC_URL, PRIVATE_KEY, ROUTER_ADDRESS.");
    return;
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Baca dan stringify meta.json
  const metaObject = JSON.parse(fs.readFileSync("meta.json", "utf8"));
  const metaString = JSON.stringify(metaObject);

  // ABI minimal untuk fungsi swapBridge(string)
  const iface = new ethers.utils.Interface([
    "function swapBridge(string meta)"
  ]);

  // Encode calldata
  const calldata = iface.encodeFunctionData("swapBridge", [metaString]);

  // Estimasi & kirim transaksi
  const tx = await wallet.sendTransaction({
    to: routerAddress,
    data: calldata,
    value: ethers.utils.parseEther("1.0") // 1 PLUME, jika native
  });

  console.log("📤 TX sent. Hash:");
  console.log(tx.hash);

  const receipt = await tx.wait();
  console.log("✅ TX confirmed in block:", receipt.blockNumber);
}

main().catch(console.error);
