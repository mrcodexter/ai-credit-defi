import pkg from "hardhat";
const { ethers } = pkg as any;

async function main() {
  const LendingPool = await ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy();

  await (lendingPool as any).waitForDeployment();

  console.log(`LendingPool deployed to: ${await (lendingPool as any).getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
