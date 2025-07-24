const { ethers } = require("hardhat");
const fs = require("fs");

/**
 * Script untuk berinteraksi dengan deployed contract
 * Demonstrasi semua functionality contract
 */
async function main() {
  console.log("🧪 Starting contract interaction testing...\n");

  // Load deployment info
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
    console.log("📋 Loaded deployment info from deployment-info.json");
  } catch (error) {
    console.log("⚠️  No deployment-info.json found. Please deploy first.");
    console.log("Run: npx hardhat run scripts/deploy.js");
    return;
  }

  // Get signers
  const [deployer, treasury, user1, user2, user3] = await ethers.getSigners();
  
  // Get contract instances
  const ComprehensiveLearningContract = await ethers.getContractFactory("ComprehensiveLearningContract");
  const contract = ComprehensiveLearningContract.attach(deploymentInfo.contracts.ComprehensiveLearningContract);
  
  const RewardSystem = await ethers.getContractFactory("RewardSystem");
  const rewardSystem = RewardSystem.attach(deploymentInfo.contracts.RewardSystem);

  console.log("🔗 Connected to contracts:");
  console.log("  Main Contract:", await contract.getAddress());
  console.log("  Reward System:", await rewardSystem.getAddress());
  console.log();

  try {
    // =================================
    // 1. BASIC CONTRACT INFO
    // =================================
    console.log("📊 === CONTRACT INFORMATION ===");
    
    const contractName = await contract.contractName();
    const versionInfo = await contract.getVersionInfo();
    const owner = await contract.owner();
    const isActive = await contract.isActive();
    
    console.log(`  Contract Name: ${contractName}`);
    console.log(`  Version: ${versionInfo[0]}`);
    console.log(`  Owner: ${owner}`);
    console.log(`  Is Active: ${isActive}`);
    console.log(`  Deployment Time: ${new Date(Number(await contract.deploymentTime()) * 1000).toLocaleString()}`);
    console.log();

    // =================================
    // 2. USER REGISTRATION TESTING
    // =================================
    console.log("👥 === USER REGISTRATION TESTING ===");
    
    // Register user2 if not already registered
    try {
      const user2Info = await contract.getUserInfo(user2.address);
      if (user2Info[0] == 0) { // User ID 0 means not registered
        console.log("🔄 Registering user2...");
        const regTx = await contract.connect(user2).registerUser("Alice Smith", 500, {
          value: ethers.parseEther("0.01")
        });
        await regTx.wait();
        console.log("✅ User2 (Alice) registered successfully");
      } else {
        console.log("ℹ️  User2 already registered");
      }
    } catch (error) {
      console.log("❌ Error registering user2:", error.message);
    }

    // Register user3 if not already registered
    try {
      const user3Info = await contract.getUserInfo(user3.address);
      if (user3Info[0] == 0) { // User ID 0 means not registered
        console.log("🔄 Registering user3...");
        const regTx = await contract.connect(user3).registerUser("Bob Johnson", 750, {
          value: ethers.parseEther("0.01")
        });
        await regTx.wait();
        console.log("✅ User3 (Bob) registered successfully");
      } else {
        console.log("ℹ️  User3 already registered");
      }
    } catch (error) {
      console.log("❌ Error registering user3:", error.message);
    }
    console.log();

    // =================================
    // 3. USER INFO TESTING
    // =================================
    console.log("👤 === USER INFORMATION ===");
    
    const users = [
      { signer: user1, name: "User1" },
      { signer: user2, name: "User2" },
      { signer: user3, name: "User3" }
    ];

    for (const user of users) {
      try {
        const userInfo = await contract.getUserInfo(user.signer.address);
        if (userInfo[0] > 0) { // If registered
          console.log(`${user.name} (${user.signer.address}):`);
          console.log(`  ID: ${userInfo[0]}`);
          console.log(`  Name: ${userInfo[1]}`);
          console.log(`  Balance: ${userInfo[2]} wei`);
          console.log(`  Status: ${userInfo[3]} (0=Inactive, 1=Active, 2=Suspended, 3=Banned)`);
          console.log(`  Verified: ${userInfo[4]}`);
          console.log();
        }
      } catch (error) {
        console.log(`❌ Error getting ${user.name} info:`, error.message);
      }
    }

    // =================================
    // 4. DEPOSIT TESTING
    // =================================
    console.log("💰 === DEPOSIT TESTING ===");
    
    try {
      console.log("🔄 User2 depositing 0.005 ETH...");
      const depositTx = await contract.connect(user2).deposit({
        value: ethers.parseEther("0.005")
      });
      await depositTx.wait();
      console.log("✅ Deposit successful");
      
      // Check updated balance
      const user2Info = await contract.getUserInfo(user2.address);
      console.log(`📊 User2 new balance: ${user2Info[2]} wei`);
    } catch (error) {
      console.log("❌ Deposit error:", error.message);
    }
    console.log();

    // =================================
    // 5. TRANSFER TESTING
    // =================================
    console.log("🔄 === TRANSFER TESTING ===");
    
    try {
      const transferAmount = 1000;
      console.log(`🔄 User1 transferring ${transferAmount} wei to User2...`);
      
      const transferTx = await contract.connect(user1).transferWithFee(user2.address, transferAmount);
      await transferTx.wait();
      console.log("✅ Transfer successful");
      
      // Check balances after transfer
      const user1Info = await contract.getUserInfo(user1.address);
      const user2Info = await contract.getUserInfo(user2.address);
      console.log(`📊 User1 balance after transfer: ${user1Info[2]} wei`);
      console.log(`📊 User2 balance after transfer: ${user2Info[2]} wei`);
    } catch (error) {
      console.log("❌ Transfer error:", error.message);
    }
    console.log();

    // =================================
    // 6. PRODUCT CREATION TESTING
    // =================================
    console.log("🛍️ === PRODUCT CREATION TESTING ===");
    
    try {
      console.log("🔄 User1 creating a product...");
      const productTx = await contract.connect(user1).createProduct(
        "Laptop Gaming",
        "High-end gaming laptop with RTX 4080",
        ethers.parseEther("2.5"), // 2.5 ETH
        2, // High priority
        ["gaming", "laptop", "electronics"]
      );
      const receipt = await productTx.wait();
      
      // Get product ID from event
      const productCreatedEvent = receipt.logs.find(log => 
        log.fragment && log.fragment.name === 'ProductCreated'
      );
      
      if (productCreatedEvent) {
        const productId = productCreatedEvent.args[0];
        console.log("✅ Product created with ID:", productId.toString());
        
        // Check if product is available
        const isAvailable = await contract.isProductAvailable(productId);
        console.log(`📊 Product available: ${isAvailable}`);
      }
    } catch (error) {
      console.log("❌ Product creation error:", error.message);
    }
    console.log();

    // =================================
    // 7. ADMIN FUNCTIONS TESTING
    // =================================
    console.log("👑 === ADMIN FUNCTIONS TESTING ===");
    
    try {
      console.log("🔄 Owner verifying user2...");
      const verifyTx = await contract.connect(deployer).verifyUser(user2.address);
      await verifyTx.wait();
      console.log("✅ User2 verified successfully");
      
      // Check verification status
      const user2Info = await contract.getUserInfo(user2.address);
      console.log(`📊 User2 verified status: ${user2Info[4]}`);
    } catch (error) {
      console.log("❌ Verification error:", error.message);
    }
    console.log();

    // =================================
    // 8. LIBRARY FUNCTIONS TESTING
    // =================================
    console.log("📚 === LIBRARY FUNCTIONS TESTING ===");
    
    try {
      const baseAmount = 1000;
      const reward = await contract.calculateUserReward(user1.address, baseAmount);
      console.log(`💰 Calculated reward for ${baseAmount} base amount: ${reward} wei`);
      
      const principal = 10000;
      const rate = 500; // 5%
      const time = 3;
      const compoundInterest = await contract.calculateCompoundInterest(principal, rate, time);
      console.log(`📈 Compound interest calculation:`);
      console.log(`   Principal: ${principal}, Rate: ${rate/100}%, Time: ${time} periods`);
      console.log(`   Result: ${compoundInterest}`);
    } catch (error) {
      console.log("❌ Library function error:", error.message);
    }
    console.log();

    // =================================
    // 9. CONTRACT STATISTICS
    // =================================
    console.log("📊 === CONTRACT STATISTICS ===");
    
    try {
      const stats = await contract.getContractStats();
      console.log(`  Total Users: ${stats[0]}`);
      console.log(`  Total Balance: ${ethers.formatEther(stats[1])} ETH`);
      console.log(`  Contract Age: ${stats[2]} seconds`);
      console.log(`  Current State: ${stats[3]} (0=Deployed, 1=Initialized, 2=Running, 3=Paused, 4=Terminated)`);
      
      const whitelistedUsers = await contract.getWhitelistedUsers();
      console.log(`  Whitelisted Users: ${whitelistedUsers.length}`);
      whitelistedUsers.forEach((addr, index) => {
        console.log(`    ${index + 1}. ${addr}`);
      });
    } catch (error) {
      console.log("❌ Stats error:", error.message);
    }
    console.log();

    // =================================
    // 10. REWARD SYSTEM TESTING
    // =================================
    console.log("🎁 === REWARD SYSTEM TESTING ===");
    
    try {
      const rewardAmount = await rewardSystem.calculateReward(user1.address, 10000);
      console.log(`💰 Calculated reward from RewardSystem: ${rewardAmount} wei`);
    } catch (error) {
      console.log("❌ Reward system error:", error.message);
    }
    console.log();

    console.log("🎉 === TESTING COMPLETED SUCCESSFULLY ===");
    console.log("\n📝 Summary:");
    console.log("✅ Contract information retrieved");
    console.log("✅ User registration tested");
    console.log("✅ Deposit functionality tested");
    console.log("✅ Transfer functionality tested");
    console.log("✅ Product creation tested");
    console.log("✅ Admin functions tested");
    console.log("✅ Library functions tested");
    console.log("✅ Contract statistics retrieved");
    console.log("✅ Reward system tested");

  } catch (error) {
    console.error("❌ Testing failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
