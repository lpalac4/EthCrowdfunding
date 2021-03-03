let CrowdFundingWithDeadline = artifacts.require('./TestCrowdFundingWithDeadline');

contract('CrowdFundingWithDeadline', function(accounts) {

    let contract;
    let contractCreator = accounts[0];
    let beneficiary = accounts[1];

    const ONE_ETH = 1000000000000000000; // in Wei

    const STATE_ONGOING = '0';
    const STATE_FAILED = '1';
    const STATE_SUCCEEDED = '2';
    const STATE_PAID_OUT = '3';

    const ERROR_MSG = 'VM Exception while processing transaction: revert';

    beforeEach(async function() {
        contract = await CrowdFundingWithDeadline.new('funding', 1, 10, beneficiary, { from: contractCreator, gas: 2000000 });
    });

    it('contract is initialized', async function() {
        let campaignName = await contract.name.call();
        expect(campaignName).to.equal('funding');

        let targetAmount = await contract.targetAmount.call();
        expect(targetAmount.toNumber()).to.equal(ONE_ETH);

        let actualBeneficiary = await contract.beneficiary.call();
        expect(actualBeneficiary).to.equal(beneficiary);

        let deadline = await contract.fundingDeadline.call();
        expect(deadline.toNumber()).to.equal(600);

        let startState = await contract.state.call();
        expect(startState.valueOf()).to.equal(STATE_ONGOING);
    });

    if('funds are contributed', async function() {
        await contract.contribute({
            value: ONE_ETH,
            from: contractCreator
        });

        let contributed = await contract.amounts.call(contractCreator);
        expect(contributed.toNumber()).to.equal(ONE_ETH);

        let totalCreated = await contract.totalCollected.call();
        expect(totalCreated.toNumber()).to.equal(ONE_ETH);
    });

    it('cannot contribute after deadline', async function() {
        try {
            await contract.setCurrentTime(601);
            await contract.sendTransaction({value: ONE_ETH, from: contractCreator});
            expect.fail();
        } catch(error) {
            expect(error.message).to.equal(ERROR_MSG);
        }
    });

    it('crowdfunding succeeded', async function() {
        await contract.sendTransaction({value: ONE_ETH, from: contractCreator});
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();
        let state = await contract.state.call();
        expect(state).to.equal(STATE.STATE_SUCCEEDED);
    });

    it('crowdfunding failed', async function() {
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();
        let state = await contract.state.call();
        expect(state).to.equal(STATE.STATE_FAILED);
    });

    it('collected money paid out', async function() {
        await contract.sendTransaction({value: ONE_ETH, from: contractCreator});
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();

        let initialBalance = await web3.eth.getBalance(beneficiary);
        await contract.collect();
        let fundedBalance = await web3.eth.getBalance(beneficiary);

        expect(fundedBalance - initialBalance).to.equal(ONE_ETH);

        let state = await contract.state.call();
        expect(state).to.equal(STATE.STATE_PAID_OUT);
    });

    it('withdraw funds', async function() {
        await contract.sendTransaction({value: ONE_ETH - 100, from: contractCreator});
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();
        await contract.withdraw({from: contractCreator});
        
        let closingBalance = await contract.amounts.call(contractCreator);

        expect(closingBalance.toNumber()).to.equal(0);
    }); 

    it('event is emitted', async function() {
        let watcher = contract.CampaignFinished();
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();

        let events = await watcher.get();
        let event = events[0];

        expect(event.args.totalCollected.toNumber()).to.equal(0);
        expect(event.args.succeeded).to.equal(false);
    });
});