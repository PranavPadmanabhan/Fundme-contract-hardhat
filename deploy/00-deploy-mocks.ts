import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChain, DECIMALS, INITIAL_DATA } from "../helper-config";
import { DeployFunction } from "hardhat-deploy/types";

const deployMocks: DeployFunction = async ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  if (developmentChain.includes(network.name)) {
    log("Local network detected! deploying Mocks..");
    // console.log("local networks");
    await deploy("MockV3Aggregator", {
      from: deployer,
      contract: "MockV3Aggregator",
      log: true,
      args: [DECIMALS, INITIAL_DATA],
    });
    log("Mocks Deployed");
    log("--------------------------------------------");
  }
};

module.exports = deployMocks;

module.exports.tags = ["all", "mocks"];
