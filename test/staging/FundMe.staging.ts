import { assert } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChain } from "../../helper-config";
import { FundMe } from "../../typechain-types";

developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe: FundMe;
      let deployer: any;
      const sentValue = ethers.utils.parseEther("0.3");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("allows to fund from users and withdraw", async () => {
        await fundMe.fund({ value: sentValue });
        await fundMe.withdraw();
        const updatedBalance = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(updatedBalance.toString(), "0");
      });
    });
