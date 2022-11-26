import { assert, expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChain } from "../../helper-config";
import { FundMe, MockV3Aggregator } from "../../typechain-types";

!developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe: FundMe;
      let mockV3Aggregator: MockV3Aggregator;
      let deployer: any;
      const sentValue = ethers.utils.parseEther("0.3");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        // const accounts = await ethers.getSigners();
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", async () => {
        it("should set priceFeed address correctly", async () => {
          const response = await fundMe.priceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", async () => {
        it("should fails when enough amount is not transferred", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            "amount should be greater than 1"
          );
        });

        it("should update the data when funded correct amount", async () => {
          await fundMe.fund({ value: sentValue });
          const response = await fundMe.addressToAmount(deployer);
          assert.equal(response.toString(), sentValue.toString());
        });

        it("should add funder to funders array", async () => {
          await fundMe.fund({ value: sentValue });
          const response = await fundMe.funders(0);
          assert.equal(response.includes(deployer), true);
        });
      });

      describe("withdraw", async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sentValue });
        });

        it("should not call with single funder", async () => {
          const currentFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          );
          const currentDeployerBalance = await ethers.provider.getBalance(
            deployer
          );
          const transactionResponse = await fundMe.withdraw();
          const reciept = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = reciept;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const updatedFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          );
          const updatedDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          assert.equal(
            currentDeployerBalance.add(currentFundMeBalance).toString(),
            updatedDeployerBalance.add(gasCost).toString()
          );
          assert.equal(updatedFundMeBalance.toString(), "0");
        });

        it("should update funders array", async () => {
          await fundMe.withdraw();
          const response = await fundMe.getFunders();
          assert.equal(response.length, 0);
        });

        it("allow us to withdraw with multiple funders", async () => {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < accounts.length; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sentValue });
          }
          const currentFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          );
          const currentDeployerBalance = await ethers.provider.getBalance(
            deployer
          );
          const transactionResponse = await fundMe.withdraw();
          const reciept = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = reciept;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const updatedFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          );
          const updatedDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          /// checks all the funds are added to owners account or not

          assert.equal(
            currentDeployerBalance.add(currentFundMeBalance).toString(),
            updatedDeployerBalance.add(gasCost).toString()
          );

          // checks fundme balance is zero or not
          assert.equal(updatedFundMeBalance.toString(), "0");

          // checks funders array reset or not
          await expect(fundMe.funders(0)).to.be.reverted;

          // checks mapping reset or not

          for (let i = 1; i < accounts.length; i++) {
            expect(await fundMe.addressToAmount(accounts[i].address), "0");
          }
        });

        it("should only withdraw fund if its the owner", async () => {
          const accounts = await ethers.getSigners();
          const notOwner = accounts[1];
          const connectAccount = fundMe.connect(notOwner);
          await expect(connectAccount.withdraw()).to.be.reverted;
        });
      });
    });
