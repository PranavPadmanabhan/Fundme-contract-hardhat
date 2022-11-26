import { deployments, ethers, getNamedAccounts } from "hardhat";
import { FundMe } from "../typechain-types";

async function main() {
  const deployer = (await getNamedAccounts()).deployer;
  await deployments.fixture(["all"]);
  const fundMe: FundMe = await ethers.getContract("FundMe", deployer);
  const sendValue = ethers.utils.parseEther("0.3");
  const tx = await fundMe.fund({ value: sendValue });
  await tx.wait(1);
}

main()
  .then(() => {
    console.log("transaction completed");
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
