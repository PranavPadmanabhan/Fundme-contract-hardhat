// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

contract FundMe {
    using PriceConverter for uint256;

    // constant and immutable keywords save gas
    address public immutable owner;

    uint256 public constant MINIMUM_USD = 50 * 1e18;
    mapping(address => uint256) public addressToAmount;
    address[] public funders;

    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not Authorized");
        _;
    }

    function fund() public payable {
        // want to set minimum value

        require(
            msg.value.getConversionRate(priceFeed) > MINIMUM_USD,
            "amount should be greater than 1"
        );
        funders.push(msg.sender);
        addressToAmount[msg.sender] += msg.value;
        // want to send ether
    }

    function withdraw() public onlyOwner {
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            addressToAmount[funder] = 0;
        }
        funders = new address[](0);

        // withdraw money

        // //transfer
        // payable(msg.sender).transfer(address(this).balance);

        // //send
        // bool success =  payable(msg.sender).send(address(this).balance);
        // require(success,"send failed");

        // call

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "call failed");
    }

    // if the transaction is done without msg.data then recieve function will be triggered

    // else fallback

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }

    function getFunders() public view returns (address[] memory) {
        return funders;
    }
}
