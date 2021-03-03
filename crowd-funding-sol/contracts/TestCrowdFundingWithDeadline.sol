pragma solidity ^0.5.16;

import './CrowdFundingWithDeadline.sol';

contract TestCrowdFundingWithDeadline is CrowdFundingWithDeadline {
    uint time;

    constructor(string memory contractName, uint targetAmountEth, uint durationInMin, address payable beneficiary)
        CrowdFundingWithDeadline(contractName, targetAmountEth, durationInMin, beneficiary) public {

    }

    function currentTime() internal view returns(uint) {
        return time;
    }

    function setCurrentTime(uint newTime) public {
        time = newTime;
    }
}