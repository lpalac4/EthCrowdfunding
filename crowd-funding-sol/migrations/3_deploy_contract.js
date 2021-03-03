let CrowdFundingWithDeadline = artifacts.require('./CrowdFundingWithDeadline.sol');

module.exports = function(deployer) {
    deployer.deploy(
        CrowdFundingWithDeadline,
        'Test Campaign',
        1,
        200,
        '0x12587571d28418519E549Da832C8167261EFBCc0'
    );
}