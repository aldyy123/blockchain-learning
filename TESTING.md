# 🚀 Comprehensive Smart Contract Testing Guide

Panduan lengkap untuk melakukan testing smart contract ComprehensiveLearningContract di development environment.

## 📋 Prerequisites

Pastikan Anda sudah menginstall:
- [Node.js](https://nodejs.org/) (v16 atau lebih baru)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

## 🔧 Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Compile contracts:**
   ```bash
   npm run compile
   ```

## 🧪 Testing Methods

### Method 1: Quick Testing (Recommended)
Jalankan seluruh workflow testing dengan satu command:

```bash
npm run workflow
```

Ini akan menjalankan:
- ✅ Cleanup previous builds
- ✅ Install dependencies
- ✅ Compile contracts
- ✅ Run unit tests
- ✅ Deploy contracts
- ✅ Run interaction tests

### Method 2: Step by Step Testing

#### 1. Run Unit Tests
```bash
npm run test
```

Untuk testing dengan gas report:
```bash
npm run test:gas
```

#### 2. Deploy Contracts
```bash
npm run deploy
```

#### 3. Interact with Deployed Contracts
```bash
npm run interact
```

### Method 3: Local Blockchain Testing

#### 1. Start Local Hardhat Node
Di terminal pertama:
```bash
npm run node
```
Ini akan menjalankan local blockchain di `http://127.0.0.1:8545`

#### 2. Deploy ke Local Network
Di terminal kedua:
```bash
npm run deploy:localhost
```

#### 3. Interact dengan Local Network
```bash
npm run interact:localhost
```

## 📊 What Gets Tested

### 1. **Contract Deployment**
- ✅ ComprehensiveLearningContract deployment
- ✅ RewardSystem deployment
- ✅ Constructor parameters validation
- ✅ Initial state verification

### 2. **User Management**
- ✅ User registration with fee
- ✅ User info retrieval
- ✅ Whitelist functionality
- ✅ User status management

### 3. **Financial Operations**
- ✅ Ether deposits
- ✅ Balance tracking
- ✅ Transfers with fees
- ✅ Withdrawal with safety checks

### 4. **Product Management**
- ✅ Product creation
- ✅ Product availability checking
- ✅ Seller assignment

### 5. **Admin Functions**
- ✅ User verification
- ✅ Status updates
- ✅ Emergency pause/unpause
- ✅ Owner-only functions

### 6. **Library Functions**
- ✅ MathUtils percentage calculation
- ✅ Compound interest calculation
- ✅ Reward calculations

### 7. **Advanced Features**
- ✅ Event emission
- ✅ Error handling
- ✅ Modifier functionality
- ✅ Interface implementation

## 📁 Generated Files

Setelah testing, file-file berikut akan dibuat:

- **`deployment-info.json`** - Informasi deployment contract
- **`artifacts/`** - Compiled contract artifacts
- **`cache/`** - Hardhat cache files

## 🔍 Testing Output Example

```
🚀 Starting deployment of ComprehensiveLearningContract...

📋 Deployment Information:
  Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  Treasury: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
  User1: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
  User2: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
  User3: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65

📦 Deploying ComprehensiveLearningContract...
✅ ComprehensiveLearningContract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

📦 Deploying RewardSystem...
✅ RewardSystem deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

🧪 Testing basic functionality...
✅ User1 registered successfully

📊 Contract Stats:
  totalUsers: 3
  totalBalance: 0.01 ETH
  contractAge: 2 seconds
  state: 1
```

## 🐛 Troubleshooting

### Common Issues:

1. **"Cannot find module" error:**
   ```bash
   rm -rf node_modules/
   npm install
   ```

2. **Compilation failed:**
   ```bash
   npm run clean
   npm run compile
   ```

3. **Gas estimation failed:**
   - Check account balances
   - Ensure proper function parameters

4. **Network connection issues:**
   - Restart Hardhat node
   - Check network configuration

## 📊 Gas Optimization

Untuk menganalisis gas usage:

```bash
REPORT_GAS=true npm test
```

## 🔒 Security Testing

Kontrak ini sudah mengimplementasikan:
- ✅ ReentrancyGuard dari OpenZeppelin
- ✅ Access control dengan Ownable
- ✅ Input validation
- ✅ Safe transfers
- ✅ Emergency pause functionality

## 🌐 Network Configuration

### Local Development
- Network: Hardhat
- RPC: http://127.0.0.1:8545
- Chain ID: 31337

### Testnets (untuk future deployment)
Tambahkan ke `hardhat.config.js`:
```javascript
networks: {
  goerli: {
    url: "https://goerli.infura.io/v3/YOUR_INFURA_KEY",
    accounts: ["YOUR_PRIVATE_KEY"]
  }
}
```

## 📚 Learning Resources

Kontrak ini mengcover semua konsep Solidity:
1. **Data Types**: uint, int, address, bool, bytes, string, arrays, mappings
2. **Functions**: view, pure, payable, internal, external, private
3. **Modifiers**: Custom access control
4. **Events**: Logging dan monitoring
5. **Inheritance**: OpenZeppelin contracts
6. **Libraries**: Custom MathUtils library
7. **Interfaces**: IRewardSystem implementation
8. **Error Handling**: Custom errors dan require statements

## 🎯 Next Steps

1. **Deploy to Testnet:**
   ```bash
   npx hardhat run scripts/deploy.js --network goerli
   ```

2. **Verify on Etherscan:**
   ```bash
   npx hardhat verify CONTRACT_ADDRESS --network goerli
   ```

3. **Build Frontend:**
   - Use Web3.js atau Ethers.js
   - Connect with MetaMask
   - Read deployment-info.json untuk contract addresses

## 💡 Tips

- Selalu test di local environment dulu
- Monitor gas usage untuk optimization
- Gunakan events untuk debugging
- Backup private keys dengan aman
- Test semua edge cases

Happy Testing! 🚀
