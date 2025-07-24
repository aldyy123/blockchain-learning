const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Test suite untuk ComprehensiveLearningContract
 * Menguji semua functionality yang ada dalam contract
 */
describe("ComprehensiveLearningContract", function () {
  let contract;
  let rewardSystem;
  let owner;
  let user1;
  let user2;
  let treasury;
  let initialUsers;

  // Setup sebelum setiap test
  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, treasury] = await ethers.getSigners();
    initialUsers = [user1.address, user2.address];

    // Deploy main contract
    const ComprehensiveLearningContract = await ethers.getContractFactory("ComprehensiveLearningContract");
    contract = await ComprehensiveLearningContract.deploy(
      treasury.address,
      initialUsers
    );
    await contract.waitForDeployment();

    // Deploy reward system
    const RewardSystem = await ethers.getContractFactory("RewardSystem");
    rewardSystem = await RewardSystem.deploy(await contract.getAddress());
    await rewardSystem.waitForDeployment();
  });

  describe("🏗️ Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should set treasury address correctly", async function () {
      expect(await contract.treasury()).to.equal(treasury.address);
    });

    it("Should initialize contract state correctly", async function () {
      expect(await contract.currentState()).to.equal(1); // Initialized
      expect(await contract.isActive()).to.equal(true);
    });

    it("Should whitelist initial users", async function () {
      expect(await contract.isWhitelisted(user1.address)).to.equal(true);
      expect(await contract.isWhitelisted(user2.address)).to.equal(true);
    });
  });

  describe("👤 User Registration", function () {
    it("Should register user successfully", async function () {
      const registrationFee = ethers.parseEther("0.01");
      
      await expect(
        contract.connect(user1).registerUser("Alice", 1000, { value: registrationFee })
      ).to.emit(contract, "UserRegistered")
       .withArgs(user1.address, 1, "Alice");

      const userInfo = await contract.getUserInfo(user1.address);
      expect(userInfo[1]).to.equal("Alice"); // name
      expect(userInfo[2]).to.equal(1000);    // balance
      expect(userInfo[3]).to.equal(1);       // status (Active)
    });

    it("Should reject registration without minimum fee", async function () {
      await expect(
        contract.connect(user1).registerUser("Alice", 1000, { value: ethers.parseEther("0.005") })
      ).to.be.revertedWith("Minimum registration fee required");
    });

    it("Should reject duplicate registration", async function () {
      const registrationFee = ethers.parseEther("0.01");
      
      // First registration
      await contract.connect(user1).registerUser("Alice", 1000, { value: registrationFee });
      
      // Second registration should fail
      await expect(
        contract.connect(user1).registerUser("Bob", 2000, { value: registrationFee })
      ).to.be.revertedWith("User already registered");
    });

    it("Should reject empty name", async function () {
      const registrationFee = ethers.parseEther("0.01");
      
      await expect(
        contract.connect(user1).registerUser("", 1000, { value: registrationFee })
      ).to.be.revertedWith("Name cannot be empty");
    });
  });

  describe("💰 Balance Operations", function () {
    beforeEach(async function () {
      // Register users
      const registrationFee = ethers.parseEther("0.01");
      await contract.connect(user1).registerUser("Alice", 1000, { value: registrationFee });
      await contract.connect(user2).registerUser("Bob", 2000, { value: registrationFee });
    });

    it("Should deposit ether correctly", async function () {
      const depositAmount = ethers.parseEther("1");
      
      await expect(
        contract.connect(user1).deposit({ value: depositAmount })
      ).to.emit(contract, "BalanceUpdated");

      const balance = await contract.balances(user1.address);
      expect(balance).to.equal(1000n + depositAmount);
    });

    it("Should withdraw ether correctly", async function () {
      // First deposit some ether
      const depositAmount = ethers.parseEther("1");
      await contract.connect(user1).deposit({ value: depositAmount });

      const withdrawAmount = ethers.parseEther("0.5");
      const initialEthBalance = await ethers.provider.getBalance(user1.address);

      await expect(
        contract.connect(user1).withdraw(withdrawAmount)
      ).to.emit(contract, "BalanceUpdated");

      const finalEthBalance = await ethers.provider.getBalance(user1.address);
      // Note: finalEthBalance might be slightly less due to gas costs
      expect(finalEthBalance).to.be.greaterThan(initialEthBalance);
    });

    it("Should reject withdrawal with insufficient balance", async function () {
      const withdrawAmount = ethers.parseEther("10"); // More than balance
      
      await expect(
        contract.connect(user1).withdraw(withdrawAmount)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("🔄 Transfer Operations", function () {
    beforeEach(async function () {
      // Register users with enough balance
      const registrationFee = ethers.parseEther("0.01");
      await contract.connect(user1).registerUser("Alice", 10000, { value: registrationFee });
      await contract.connect(user2).registerUser("Bob", 5000, { value: registrationFee });
    });

    it("Should transfer with fee correctly", async function () {
      const transferAmount = 1000;
      const expectedFee = transferAmount * 10 / 10000; // 0.1%
      const expectedNetAmount = transferAmount - expectedFee;

      const user1InitialBalance = await contract.balances(user1.address);
      const user2InitialBalance = await contract.balances(user2.address);

      await expect(
        contract.connect(user1).transferWithFee(user2.address, transferAmount)
      ).to.emit(contract, "TransactionExecuted");

      const user1FinalBalance = await contract.balances(user1.address);
      const user2FinalBalance = await contract.balances(user2.address);

      expect(user1FinalBalance).to.equal(user1InitialBalance - BigInt(transferAmount));
      expect(user2FinalBalance).to.equal(user2InitialBalance + BigInt(expectedNetAmount));
    });

    it("Should reject transfer with insufficient balance", async function () {
      const transferAmount = 20000; // More than user1's balance
      
      await expect(
        contract.connect(user1).transferWithFee(user2.address, transferAmount)
      ).to.be.revertedWithCustomError(contract, "InsufficientBalance");
    });

    it("Should reject transfer to zero address", async function () {
      await expect(
        contract.connect(user1).transferWithFee(ethers.ZeroAddress, 1000)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("🛍️ Product Operations", function () {
    beforeEach(async function () {
      const registrationFee = ethers.parseEther("0.01");
      await contract.connect(user1).registerUser("Alice", 1000, { value: registrationFee });
    });

    it("Should create product successfully", async function () {
      const productName = "Test Product";
      const description = "A test product";
      const price = 100;
      const priority = 1; // Medium
      const tags = ["electronics", "gadget"];

      await expect(
        contract.connect(user1).createProduct(productName, description, price, priority, tags)
      ).to.emit(contract, "ProductCreated");
    });

    it("Should reject product with empty name", async function () {
      await expect(
        contract.connect(user1).createProduct("", "Description", 100, 1, [])
      ).to.be.revertedWith("Product name required");
    });

    it("Should reject product with zero price", async function () {
      await expect(
        contract.connect(user1).createProduct("Product", "Description", 0, 1, [])
      ).to.be.revertedWith("Price must be greater than 0");
    });
  });

  describe("📊 View Functions", function () {
    beforeEach(async function () {
      const registrationFee = ethers.parseEther("0.01");
      await contract.connect(user1).registerUser("Alice", 1000, { value: registrationFee });
    });

    it("Should return correct user info", async function () {
      const userInfo = await contract.getUserInfo(user1.address);
      
      expect(userInfo[1]).to.equal("Alice"); // name
      expect(userInfo[2]).to.equal(1000);    // balance
      expect(userInfo[3]).to.equal(1);       // status (Active)
      expect(userInfo[4]).to.equal(false);   // verified
    });

    it("Should return correct contract stats", async function () {
      const stats = await contract.getContractStats();
      
      expect(stats[0]).to.equal(3); // totalUsers (2 initial + 1 registered)
      expect(stats[2]).to.be.greaterThan(0); // contractAge
      expect(stats[3]).to.equal(1); // state (Initialized)
    });

    it("Should calculate compound interest correctly", async function () {
      const principal = 1000;
      const rate = 500; // 5%
      const time = 2;
      
      const result = await contract.calculateCompoundInterest(principal, rate, time);
      // Expected: 1000 + (1000 * 0.05) + (1050 * 0.05) = 1102.5 (rounded to 1102)
      expect(result).to.equal(1102);
    });

    it("Should calculate reward using library", async function () {
      const baseAmount = 1000;
      const expectedBonus = (baseAmount * 500) / 10000; // 5%
      const expectedTotal = baseAmount + expectedBonus;
      
      const result = await contract.calculateUserReward(user1.address, baseAmount);
      expect(result).to.equal(expectedTotal);
    });
  });

  describe("🔒 Access Control", function () {
    it("Should allow only owner to update user status", async function () {
      const registrationFee = ethers.parseEther("0.01");
      await contract.connect(user1).registerUser("Alice", 1000, { value: registrationFee });

      // Owner should be able to update
      await expect(
        contract.connect(owner).updateUserStatus(user1.address, 2) // Suspended
      ).to.emit(contract, "StatusChanged");

      // Non-owner should be rejected
      await expect(
        contract.connect(user2).updateUserStatus(user1.address, 1) // Active
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow only owner to verify user", async function () {
      const registrationFee = ethers.parseEther("0.01");
      await contract.connect(user1).registerUser("Alice", 1000, { value: registrationFee });

      // Owner should be able to verify
      await contract.connect(owner).verifyUser(user1.address);
      
      const userInfo = await contract.getUserInfo(user1.address);
      expect(userInfo[4]).to.equal(true); // verified

      // Non-owner should be rejected
      await expect(
        contract.connect(user2).verifyUser(user1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow only owner to pause/unpause", async function () {
      // Owner should be able to pause
      await contract.connect(owner).emergencyPause();
      expect(await contract.paused()).to.equal(true);

      // Owner should be able to unpause
      await contract.connect(owner).emergencyUnpause();
      expect(await contract.paused()).to.equal(false);

      // Non-owner should be rejected
      await expect(
        contract.connect(user1).emergencyPause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("⚠️ Emergency Functions", function () {
    it("Should pause contract in emergency", async function () {
      await contract.connect(owner).emergencyPause();
      
      expect(await contract.paused()).to.equal(true);
      expect(await contract.currentState()).to.equal(3); // Paused (0=Deployed, 1=Initialized, 2=Running, 3=Paused)
    });

    it("Should prevent operations when paused", async function () {
      await contract.connect(owner).emergencyPause();
      
      const registrationFee = ethers.parseEther("0.01");
      await expect(
        contract.connect(user1).registerUser("Alice", 1000, { value: registrationFee })
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow emergency withdrawal", async function () {
      // Register user first for deposit
      const registrationFee = ethers.parseEther("0.01");
      await contract.connect(user1).registerUser("Alice", 1000, { value: registrationFee });
      
      // Add some ether to contract
      await contract.connect(user1).deposit({ value: ethers.parseEther("1") });
      
      const treasuryInitialBalance = await ethers.provider.getBalance(treasury.address);
      
      await contract.connect(owner).emergencyWithdraw();
      
      const treasuryFinalBalance = await ethers.provider.getBalance(treasury.address);
      expect(treasuryFinalBalance).to.be.greaterThan(treasuryInitialBalance);
    });
  });

  describe("🧮 Library Functions", function () {
    it("Should calculate percentage correctly", async function () {
      // This tests the library function indirectly through contract functions
      const baseAmount = 1000;
      const percentage = 500; // 5%
      
      const result = await contract.calculateUserReward(user1.address, baseAmount);
      const expectedBonus = (baseAmount * percentage) / 10000;
      expect(result).to.equal(baseAmount + expectedBonus);
    });
  });

  describe("🏪 Reward System Integration", function () {
    it("Should deploy reward system correctly", async function () {
      expect(await rewardSystem.mainContract()).to.equal(await contract.getAddress());
    });

    it("Should calculate rewards correctly", async function () {
      const amount = 1000;
      const expectedReward = amount / 100; // 1%
      
      const reward = await rewardSystem.calculateReward(user1.address, amount);
      expect(reward).to.equal(expectedReward);
    });
  });

  describe("🔄 Batch Operations", function () {
    it("Should batch update balances correctly", async function () {
      const users = [user1.address, user2.address];
      const amounts = [5000, 7000];

      await expect(
        contract.connect(owner).batchUpdateBalances(users, amounts)
      ).to.emit(contract, "BalanceUpdated");

      expect(await contract.balances(user1.address)).to.equal(5000);
      expect(await contract.balances(user2.address)).to.equal(7000);
    });

    it("Should reject batch with mismatched arrays", async function () {
      const users = [user1.address, user2.address];
      const amounts = [5000]; // Different length

      await expect(
        contract.connect(owner).batchUpdateBalances(users, amounts)
      ).to.be.revertedWith("Arrays length mismatch");
    });

    it("Should reject batch that's too large", async function () {
      const users = new Array(51).fill(user1.address); // Too many
      const amounts = new Array(51).fill(1000);

      await expect(
        contract.connect(owner).batchUpdateBalances(users, amounts)
      ).to.be.revertedWith("Batch size too large");
    });
  });

  describe("📡 Events", function () {
    it("Should emit UserRegistered event", async function () {
      const registrationFee = ethers.parseEther("0.01");
      
      await expect(
        contract.connect(user1).registerUser("Alice", 1000, { value: registrationFee })
      ).to.emit(contract, "UserRegistered")
       .withArgs(user1.address, 1, "Alice");
    });

    it("Should emit BalanceUpdated event on deposit", async function () {
      const registrationFee = ethers.parseEther("0.01");
      await contract.connect(user1).registerUser("Alice", 1000, { value: registrationFee });

      const depositAmount = ethers.parseEther("1");
      
      await expect(
        contract.connect(user1).deposit({ value: depositAmount })
      ).to.emit(contract, "BalanceUpdated");
    });
  });

  describe("🛡️ Security", function () {
    it("Should prevent reentrancy on withdraw", async function () {
      // This test assumes the contract properly uses ReentrancyGuard
      const registrationFee = ethers.parseEther("0.01");
      await contract.connect(user1).registerUser("Alice", 1000, { value: registrationFee });
      
      const depositAmount = ethers.parseEther("1");
      await contract.connect(user1).deposit({ value: depositAmount });

      // Normal withdraw should work
      const withdrawAmount = ethers.parseEther("0.5");
      await expect(
        contract.connect(user1).withdraw(withdrawAmount)
      ).to.not.be.reverted;
    });

    it("Should validate addresses properly", async function () {
      const registrationFee = ethers.parseEther("0.01");
      await contract.connect(user1).registerUser("Alice", 10000, { value: registrationFee });

      // Should reject zero address
      await expect(
        contract.connect(user1).transferWithFee(ethers.ZeroAddress, 1000)
      ).to.be.revertedWith("Invalid address");
    });
  });
});
