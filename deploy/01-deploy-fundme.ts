import { network, run } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChain, networkConfig } from "../helper-config";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../utils/verify";
import getPriceFeedAddress from "../utils/getPriceFeedAddress";

const deployFundMe: DeployFunction = async ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let priceFeedAddress: any;
  if (developmentChain.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    priceFeedAddress = ethUsdAggregator.address;
  } else {
    priceFeedAddress = getPriceFeedAddress(chainId);
    // console.log(priceFeedAddress);
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [priceFeedAddress],
    log: true,
  });

  if (
    !developmentChain.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, [priceFeedAddress]);
  }
};

module.exports = deployFundMe;

module.exports.tags = ["all", "fundMe"];
