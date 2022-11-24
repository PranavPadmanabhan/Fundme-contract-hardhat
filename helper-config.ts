const networkConfig = {
  5: {
    name: "goerli",
    priceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
  1: {
    name: "etherium mainnet",
    priceFeedAddress: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  },
};

const developmentChain = ["hardhat", "localhost"];

const INITIAL_DATA = 117559000000;
const DECIMALS = 8;

export { networkConfig, developmentChain, DECIMALS, INITIAL_DATA };
