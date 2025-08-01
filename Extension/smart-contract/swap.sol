// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PaymentAndSwap {
    address public owner;

    event PaymentReceived(address indexed from, uint256 amount, string paymentId);

    constructor() {
        owner = msg.sender;
    }

    function pay(string calldata paymentId) external payable {
        require(msg.value > 0, "Must send ETH");
        emit PaymentReceived(msg.sender, msg.value, paymentId);
    }

    function withdraw() external {
        require(msg.sender == owner, "Only owner");
        payable(owner).transfer(address(this).balance);
    }
}
