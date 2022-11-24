import { networkConfig } from "../helper-config";

const getPriceFeedAddress = (chainId: number | undefined) => {
  switch (chainId) {
    case 1:
      return networkConfig[1].priceFeedAddress;
    case 5:
      return networkConfig[5].priceFeedAddress;
  }
};

export default getPriceFeedAddress;
