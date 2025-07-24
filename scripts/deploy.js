const { ethers } = require("hardhat");
const fs = require("fs");

/**
 * Script untuk deploy ComprehensiveLearningContract
 * Enhanced deployment dengan logging dan setup yang lengkap
 */
async function main() {
  console.log("🚀 Starting deployment of ComprehensiveLearningContract...");
  
  // Get signers
  const [deployer, treasury, user1, user2, user3] = await ethers.getSigners();
  
  console.log("\n� Deployment Information:");
  console.log("  Deployer:", deployer.address);
  console.log("  Treasury:", treasury.address);
  console.log("  User1:", user1.address);
  console.log("  User2:", user2.address);
  console.log("  User3:", user3.address);
  console.log("  Deployer balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Initial users untuk whitelist (menggunakan real accounts)
  const initialUsers = [user1.address, user2.address, user3.address];

  try {
    // Deploy main contract
    console.log("\n📦 Deploying ComprehensiveLearningContract...");
    const ComprehensiveLearningContract = await ethers.getContractFactory("ComprehensiveLearningContract");
    const contract = await ComprehensiveLearningContract.deploy(
      treasury.address,
      initialUsers
    );

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log("✅ ComprehensiveLearningContract deployed to:", contractAddress);

    // Deploy RewardSystem contract
    console.log("\n📦 Deploying RewardSystem...");
    const RewardSystem = await ethers.getContractFactory("RewardSystem");
    const rewardSystem = await RewardSystem.deploy(contractAddress);
    
    await rewardSystem.waitForDeployment();
    const rewardSystemAddress = await rewardSystem.getAddress();
    
    console.log("✅ RewardSystem deployed to:", rewardSystemAddress);

    // Verify deployment berhasil dengan memanggil beberapa view functions
    
    const contractName = await contract.contractName();
    const versionInfo = await contract.getVersionInfo();
    const deployer_address = await contract.deployer();
    const deploymentTime = await contract.deploymentTime();
    
    console.log("📋 Contract Name:", contractName);
    console.log("📋 Version:", versionInfo[0]);
    console.log("📋 Deployer:", deployer_address);
    console.log("📋 Deployment Time:", new Date(Number(deploymentTime) * 1000).toLocaleString());

    // Test basic functionality dengan user1
    console.log("\n🧪 Testing basic functionality...");
    
    // Register user1
    const registrationTx = await contract.connect(user1).registerUser("Test User 1", 1000, {
      value: ethers.parseEther("0.01") // Registration fee
    });
    await registrationTx.wait();
    console.log("✅ User1 registered successfully");

    // Get user info
    const userInfo = await contract.getUserInfo(user1.address);
    console.log("👤 User1 Info:", {
      id: userInfo[0].toString(),
      name: userInfo[1],
      balance: userInfo[2].toString(),
      status: userInfo[3].toString(),
      verified: userInfo[4]
    });

    // Get contract stats
    const stats = await contract.getContractStats();
    console.log("📊 Contract Stats:", {
      totalUsers: stats[0].toString(),
      totalBalance: ethers.formatEther(stats[1]),
      contractAge: stats[2].toString() + " seconds",
      state: stats[3].toString()
    });

    // Save deployment info to file
    const deploymentInfo = {
      network: hre.network.name,
      deployer: deployer.address,
      treasury: treasury.address,
      contracts: {
        ComprehensiveLearningContract: contractAddress,
        RewardSystem: rewardSystemAddress
      },
      users: {
        user1: user1.address,
        user2: user2.address,
        user3: user3.address
      },
      deploymentTime: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber()
    };
    
    fs.writeFileSync(
      'deployment-info.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n💾 Deployment info saved to deployment-info.json");
    console.log("\n🎉 Deployment and testing completed successfully!");
    console.log("\n📝 Contract Addresses:");
    console.log("🏠 Main Contract:", contractAddress);
    console.log("🎁 Reward System:", rewardSystemAddress);
    
    console.log("\n💡 Next steps:");
    console.log("1. Run comprehensive tests: npm run test");
    console.log("2. Interact with contract: npx hardhat run scripts/interact.js");
    console.log("3. Start local blockchain: npx hardhat node");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
