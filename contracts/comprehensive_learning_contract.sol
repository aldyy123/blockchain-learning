// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ComprehensiveLearningContract
 * @dev Contract pembelajaran lengkap yang mencakup semua konsep Solidity
 * @author Ardit - Learning Web3
 * 
 * CONTRACT INI MENCAKUP:
 * 1. Semua Data Types (value types, reference types, mappings)
 * 2. Functions dengan berbagai visibility dan mutability
 * 3. Modifiers dan Access Control
 * 4. Events dan Error Handling
 * 5. Structs dan Enums
 * 6. Inheritance dan Interfaces
 * 7. Libraries dan menggunakan OpenZeppelin
 * 8. Advanced patterns dan Security best practices
 */

// Import dari OpenZeppelin untuk security dan standard implementations
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Interface untuk demonstrasi konsep interface
 * Interface mendefinisikan kontrak tanpa implementasi
 */
interface IRewardSystem {
    function calculateReward(address user, uint256 amount) external view returns (uint256);
    function distributeReward(address user, uint256 reward) external;
}

/**
 * @dev Library untuk demonstrasi konsep library
 * Library berisi fungsi reusable yang bisa digunakan oleh multiple contracts
 */
library MathUtils {
    /**
     * @dev Menghitung persentase dengan precision
     * @param amount Jumlah dasar
     * @param percentage Persentase (dalam basis point, 1% = 100)
     * @return Hasil perhitungan persentase
     */
    function calculatePercentage(uint256 amount, uint256 percentage) internal pure returns (uint256) {
        require(percentage <= 10000, "Percentage cannot exceed 100%");
        return (amount * percentage) / 10000;
    }
    
    /**
     * @dev Menghitung rata-rata dari array angka
     * @param numbers Array angka
     * @return Nilai rata-rata
     */
    function average(uint256[] memory numbers) internal pure returns (uint256) {
        require(numbers.length > 0, "Array cannot be empty");
        uint256 sum = 0;
        for (uint256 i = 0; i < numbers.length; i++) {
            sum += numbers[i];
        }
        return sum / numbers.length;
    }
}

/**
 * @title ComprehensiveLearningContract
 * @dev Contract utama yang mengimplementasikan semua konsep Solidity
 * 
 * INHERITANCE:
 * - Ownable: Memberikan access control dengan owner
 * - ReentrancyGuard: Proteksi dari reentrancy attacks
 * - Pausable: Kemampuan untuk pause/unpause contract
 */
contract ComprehensiveLearningContract is Ownable, ReentrancyGuard, Pausable {
    // ================================
    // MENGGUNAKAN LIBRARY
    // ================================
    using MathUtils for uint256;  // Attach library functions ke uint256
    
    // ================================
    // SEMUA JENIS DATA TYPES
    // ================================
    
    // VALUE TYPES - INTEGER
    uint8 public smallNumber = 255;           // 1 byte: 0-255
    uint16 public mediumNumber = 65535;       // 2 bytes: 0-65,535
    uint32 public largeNumber = 4294967295;   // 4 bytes
    uint64 public veryLargeNumber;            // 8 bytes
    uint128 public hugeNumber;                // 16 bytes
    uint256 public massiveNumber;             // 32 bytes (default uint)
    
    int8 public smallSigned = -128;           // Signed integers
    int256 public largeSigned;                // 32 bytes signed
    
    // VALUE TYPES - ADDRESS
    address public contractOwner;             // Regular address
    address payable public treasury;          // Address yang bisa menerima ether
    
    // VALUE TYPES - BOOLEAN
    bool public isActive = true;              // Boolean type
    bool public maintenanceMode = false;
    
    // VALUE TYPES - BYTES (Fixed-size)
    bytes1 public singleByte = 0xFF;          // 1 byte
    bytes4 public functionSelector;           // 4 bytes (untuk function signatures)
    bytes32 public dataHash;                  // 32 bytes (umum untuk hash)
    
    // VALUE TYPES - ENUMS
    enum UserStatus { Inactive, Active, Suspended, Banned }
    enum Priority { Low, Medium, High, Critical }
    enum ContractState { Deployed, Initialized, Running, Paused, Terminated }
    
    UserStatus public defaultStatus = UserStatus.Inactive;
    ContractState public currentState = ContractState.Deployed;
    
    // REFERENCE TYPES - ARRAYS
    uint256[] public dynamicArray;            // Dynamic array
    uint256[5] public fixedArray;             // Fixed-size array
    string[] public userNames;                // Dynamic string array
    address[] public whitelistedUsers;        // Dynamic address array
    
    // REFERENCE TYPES - STRINGS & DYNAMIC BYTES
    string public contractName = "Comprehensive Learning Contract";
    string public description;
    bytes public dynamicData;                 // Dynamic bytes
    
    // ================================
    // COMPLEX DATA STRUCTURES
    // ================================
    
    /**
     * @dev Struct untuk menyimpan informasi user yang kompleks
     * Struct mengkombinasikan berbagai data types
     */
    struct User {
        uint256 id;                          // User ID
        string name;                         // Nama user
        address wallet;                      // Alamat wallet
        uint256 balance;                     // Balance user
        uint256 reputation;                  // Skor reputasi
        UserStatus status;                   // Status user (enum)
        uint256[] transactionHistory;        // Array transaksi
        mapping(string => uint256) metadata; // Nested mapping dalam struct
        bool isVerified;                     // Verifikasi KYC
        uint256 registrationTime;            // Timestamp pendaftaran
    }
    
    /**
     * @dev Struct untuk menyimpan data produk/item
     */
    struct Product {
        uint256 productId;
        string name;
        string description;
        uint256 price;
        address seller;
        bool isAvailable;
        Priority priority;
        string[] tags;                       // Array dalam struct
    }
    
    /**
     * @dev Struct untuk transaksi yang kompleks
     */
    struct Transaction {
        uint256 txId;
        address from;
        address to;
        uint256 amount;
        uint256 fee;
        uint256 timestamp;
        bytes data;                          // Data tambahan
        bool isCompleted;
    }
    
    // ================================
    // MAPPINGS - SEMUA JENIS
    // ================================
    
    // Basic mappings
    mapping(address => uint256) public balances;           // Address ke balance
    mapping(address => bool) public isWhitelisted;         // Address ke boolean
    mapping(uint256 => string) public idToName;            // ID ke string
    mapping(bytes32 => address) public hashToAddress;      // Hash ke address
    
    // Mappings dengan complex types
    mapping(address => User) public users;                 // Address ke struct
    mapping(uint256 => Product) public products;           // ID ke product struct
    mapping(address => UserStatus) public userStatuses;    // Address ke enum
    
    // Nested mappings
    mapping(address => mapping(address => uint256)) public allowances;  // ERC20-style allowances
    mapping(address => mapping(string => bool)) public userPermissions; // User permissions
    mapping(uint256 => mapping(address => mapping(bool => uint256))) public complexMapping;
    
    // Mappings dengan arrays
    mapping(address => uint256[]) public userTransactions; // Address ke array transaksi
    mapping(string => address[]) public categoryToUsers;   // Category ke array users
    
    // ================================
    // CONSTANTS & IMMUTABLE
    // ================================
    
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18;  // Konstanta tidak bisa diubah
    uint256 public constant DECIMALS = 18;
    string public constant VERSION = "1.0.0";
    
    uint256 public immutable deploymentTime;                 // Set sekali saat deployment
    address public immutable deployer;                       // Address deployer
    
    // ================================
    // EVENTS - UNTUK LOGGING
    // ================================
    
    /**
     * @dev Events untuk logging berbagai aktivitas
     * Events lebih murah dari storage dan bisa di-filter di frontend
     */
    event UserRegistered(address indexed user, uint256 indexed userId, string name);
    event BalanceUpdated(address indexed user, uint256 oldBalance, uint256 newBalance);
    event TransactionExecuted(
        uint256 indexed txId, 
        address indexed from, 
        address indexed to, 
        uint256 amount
    );
    event ProductCreated(uint256 indexed productId, address indexed seller, string name);
    event StatusChanged(address indexed user, UserStatus oldStatus, UserStatus newStatus);
    event EmergencyAction(address indexed admin, string action, uint256 timestamp);
    
    // ================================
    // CUSTOM ERRORS (Solidity 0.8.4+)
    // ================================
    
    error InsufficientBalance(address user, uint256 required, uint256 available);
    error UserNotFound(address user);
    error ProductNotAvailable(uint256 productId);
    error UnauthorizedAccess(address caller, string requiredRole);
    error InvalidInput(string parameter, string reason);
    
    // ================================
    // MODIFIERS - ACCESS CONTROL
    // ================================
    
    /**
     * @dev Modifier untuk mengecek apakah user sudah terdaftar
     */
    modifier onlyRegisteredUser() {
        require(users[msg.sender].wallet != address(0), "User not registered");
        _;
    }
    
    /**
     * @dev Modifier untuk mengecek status user
     */
    modifier onlyActiveUser() {
        require(users[msg.sender].status == UserStatus.Active, "User not active");
        _;
    }
    
    /**
     * @dev Modifier untuk mengecek whitelist
     */
    modifier onlyWhitelisted() {
        require(isWhitelisted[msg.sender], "Not whitelisted");
        _;
    }
    
    /**
     * @dev Modifier dengan parameter untuk minimum balance
     */
    modifier minimumBalance(uint256 minAmount) {
        require(balances[msg.sender] >= minAmount, "Insufficient balance");
        _;
    }
    
    /**
     * @dev Modifier untuk validasi input
     */
    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        require(addr != address(this), "Cannot be contract address");
        _;
    }
    
    // ================================
    // CONSTRUCTOR
    // ================================
    
    /**
     * @dev Constructor yang menginisialisasi contract
     * @param _treasury Address treasury untuk menerima fee
     * @param _initialUsers Array address untuk whitelist awal
     */
    constructor(
        address payable _treasury,
        address[] memory _initialUsers
    ) {
        // Set immutable variables
        deploymentTime = block.timestamp;
        deployer = msg.sender;
        
        // Set state variables
        treasury = _treasury;
        contractOwner = msg.sender;
        currentState = ContractState.Initialized;
        
        // Initialize arrays dengan data awal
        for (uint256 i = 0; i < _initialUsers.length; i++) {
            isWhitelisted[_initialUsers[i]] = true;
            whitelistedUsers.push(_initialUsers[i]);
        }
        
        // Set beberapa data default
        fixedArray[0] = 100;
        fixedArray[1] = 200;
        dynamicArray.push(1000);
        dynamicArray.push(2000);
        
        emit EmergencyAction(msg.sender, "Contract Deployed", block.timestamp);
    }
    
    // ================================
    // VIEW FUNCTIONS (READ-ONLY)
    // ================================
    
    /**
     * @dev Function view untuk mendapatkan informasi user
     * View functions tidak mengubah state dan gratis untuk dipanggil
     */
    function getUserInfo(address userAddr) 
        external 
        view 
        returns (
            uint256 id,
            string memory name,
            uint256 balance,
            UserStatus status,
            bool verified
        ) 
    {
        User storage user = users[userAddr];
        return (
            user.id,
            user.name,
            user.balance,
            user.status,
            user.isVerified
        );
    }
    
    /**
     * @dev Pure function untuk kalkulasi tanpa mengakses state
     * Pure functions tidak membaca maupun mengubah state
     */
    function calculateCompoundInterest(
        uint256 principal,
        uint256 rate,
        uint256 time
    ) external pure returns (uint256) {
        // Compound interest formula: A = P(1 + r)^t
        // Simplified for demonstration
        uint256 result = principal;
        for (uint256 i = 0; i < time; i++) {
            result = result + (result * rate / 10000);
        }
        return result;
    }
    
    /**
     * @dev Function untuk mendapatkan contract statistics
     */
    function getContractStats() 
        external 
        view 
        returns (
            uint256 totalUsers,
            uint256 totalBalance,
            uint256 contractAge,
            ContractState state
        ) 
    {
        totalBalance = address(this).balance;
        contractAge = block.timestamp - deploymentTime;
        state = currentState;
        totalUsers = whitelistedUsers.length;
        
        return (totalUsers, totalBalance, contractAge, state);
    }
    
    /**
     * @dev Function menggunakan library untuk perhitungan
     */
    function calculateUserReward(address user, uint256 baseAmount) 
        external 
        view 
        returns (uint256) 
    {
        uint256 userBalance = balances[user];
        uint256 bonusPercentage = 500; // 5%
        
        // Menggunakan library function
        uint256 bonus = baseAmount.calculatePercentage(bonusPercentage);
        return baseAmount + bonus;
    }
    
    // ================================
    // STATE-CHANGING FUNCTIONS
    // ================================
    
    /**
     * @dev Function untuk registrasi user baru
     * Menggunakan multiple modifiers dan parameter validation
     */
    function registerUser(
        string memory _name,
        uint256 _initialBalance
    ) 
        external 
        payable 
        validAddress(msg.sender)
        whenNotPaused
    {
        // Validasi input
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(users[msg.sender].wallet == address(0), "User already registered");
        require(msg.value >= 0.01 ether, "Minimum registration fee required");
        
        // Generate user ID (should be sequential starting from 1)
        uint256 userId = 1;
        // Count actual registered users (not just whitelisted)
        for (uint256 i = 0; i < whitelistedUsers.length; i++) {
            if (users[whitelistedUsers[i]].wallet != address(0)) {
                userId++;
            }
        }
        
        // Create user struct
        User storage newUser = users[msg.sender];
        newUser.id = userId;
        newUser.name = _name;
        newUser.wallet = msg.sender;
        newUser.balance = _initialBalance;
        newUser.status = UserStatus.Active;
        newUser.isVerified = false;
        newUser.registrationTime = block.timestamp;
        newUser.reputation = 100; // Starting reputation
        
        // Update mappings dan arrays
        balances[msg.sender] = _initialBalance;
        isWhitelisted[msg.sender] = true;
        whitelistedUsers.push(msg.sender);
        userNames.push(_name);
        idToName[userId] = _name;
        
        // Set user metadata
        users[msg.sender].metadata["joinDate"] = block.timestamp;
        users[msg.sender].metadata["level"] = 1;
        
        // Transfer registration fee ke treasury
        treasury.transfer(msg.value);
        
        emit UserRegistered(msg.sender, userId, _name);
        emit BalanceUpdated(msg.sender, 0, _initialBalance);
    }
    
    /**
     * @dev Function untuk transfer dengan fee
     * Demonstrasi complex business logic
     */
    function transferWithFee(
        address to,
        uint256 amount
    ) 
        external 
        nonReentrant
        onlyRegisteredUser
        onlyActiveUser
        validAddress(to)
        whenNotPaused
    {
        // Validasi
        if (balances[msg.sender] < amount) {
            revert InsufficientBalance(msg.sender, amount, balances[msg.sender]);
        }
        
        // Hitung fee (0.1%)
        uint256 fee = amount.calculatePercentage(10); // 0.1%
        uint256 netAmount = amount - fee;
        
        // Update balances
        balances[msg.sender] -= amount;
        balances[to] += netAmount;
        balances[treasury] += fee;
        
        // Update user transaction history
        users[msg.sender].transactionHistory.push(amount);
        userTransactions[msg.sender].push(amount);
        
        // Create transaction record
        uint256 txId = userTransactions[msg.sender].length;
        
        emit TransactionExecuted(txId, msg.sender, to, netAmount);
        emit BalanceUpdated(msg.sender, balances[msg.sender] + amount, balances[msg.sender]);
        emit BalanceUpdated(to, balances[to] - netAmount, balances[to]);
    }
    
    /**
     * @dev Function untuk membuat produk baru
     * Demonstrasi penggunaan struct dan array manipulation
     */
    function createProduct(
        string memory _name,
        string memory _description,
        uint256 _price,
        Priority _priority,
        string[] memory _tags
    ) 
        external 
        onlyRegisteredUser
        onlyActiveUser
        whenNotPaused
        returns (uint256 productId)
    {
        require(bytes(_name).length > 0, "Product name required");
        require(_price > 0, "Price must be greater than 0");
        
        productId = uint256(keccak256(abi.encodePacked(
            msg.sender,
            _name,
            block.timestamp
        )));
        
        // Create product struct
        Product storage newProduct = products[productId];
        newProduct.productId = productId;
        newProduct.name = _name;
        newProduct.description = _description;
        newProduct.price = _price;
        newProduct.seller = msg.sender;
        newProduct.isAvailable = true;
        newProduct.priority = _priority;
        
        // Copy tags array
        for (uint256 i = 0; i < _tags.length; i++) {
            newProduct.tags.push(_tags[i]);
        }
        
        emit ProductCreated(productId, msg.sender, _name);
        return productId;
    }
    
    /**
     * @dev Function untuk batch operations
     * Demonstrasi penggunaan loops dan gas optimization
     */
    function batchUpdateBalances(
        address[] memory _users,
        uint256[] memory _amounts
    ) 
        external 
        onlyOwner 
        whenNotPaused
    {
        require(_users.length == _amounts.length, "Arrays length mismatch");
        require(_users.length <= 50, "Batch size too large"); // Gas limit protection
        
        for (uint256 i = 0; i < _users.length; i++) {
            address user = _users[i];
            uint256 amount = _amounts[i];
            
            require(user != address(0), "Invalid address in batch");
            
            uint256 oldBalance = balances[user];
            balances[user] = amount;
            users[user].balance = amount;
            
            emit BalanceUpdated(user, oldBalance, amount);
        }
    }
    
    // ================================
    // PAYABLE FUNCTIONS (MENERIMA ETHER)
    // ================================
    
    /**
     * @dev Function payable untuk deposit ether
     */
    function deposit() external payable onlyRegisteredUser whenNotPaused {
        require(msg.value > 0, "Must send ether");
        
        balances[msg.sender] += msg.value;
        users[msg.sender].balance += msg.value;
        
        emit BalanceUpdated(
            msg.sender, 
            balances[msg.sender] - msg.value, 
            balances[msg.sender]
        );
    }
    
    /**
     * @dev Function untuk withdraw dengan safety checks
     */
    function withdraw(uint256 amount) 
        external 
        nonReentrant 
        onlyRegisteredUser 
        minimumBalance(amount)
        whenNotPaused
    {
        balances[msg.sender] -= amount;
        users[msg.sender].balance -= amount;
        
        // Transfer ether (safe method)
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit BalanceUpdated(
            msg.sender, 
            balances[msg.sender] + amount, 
            balances[msg.sender]
        );
    }
    
    // ================================
    // ADMIN FUNCTIONS (ONLY OWNER)
    // ================================
    
    /**
     * @dev Function untuk mengubah status user (admin only)
     */
    function updateUserStatus(address user, UserStatus newStatus) 
        external 
        onlyOwner 
        validAddress(user)
    {
        require(users[user].wallet != address(0), "User not found");
        
        UserStatus oldStatus = users[user].status;
        users[user].status = newStatus;
        userStatuses[user] = newStatus;
        
        emit StatusChanged(user, oldStatus, newStatus);
    }
    
    /**
     * @dev Function untuk verifikasi user
     */
    function verifyUser(address user) external onlyOwner {
        require(users[user].wallet != address(0), "User not found");
        
        users[user].isVerified = true;
        users[user].reputation += 50; // Bonus reputation
    }
    
    /**
     * @dev Emergency function untuk pause contract
     */
    function emergencyPause() external onlyOwner {
        _pause();
        currentState = ContractState.Paused;
        emit EmergencyAction(msg.sender, "Contract Paused", block.timestamp);
    }
    
    /**
     * @dev Function untuk unpause contract
     */
    function emergencyUnpause() external onlyOwner {
        _unpause();
        currentState = ContractState.Running;
        emit EmergencyAction(msg.sender, "Contract Unpaused", block.timestamp);
    }
    
    /**
     * @dev Function untuk emergency withdrawal (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        treasury.transfer(balance);
        emit EmergencyAction(msg.sender, "Emergency Withdrawal", block.timestamp);
    }
    
    // ================================
    // INTERNAL FUNCTIONS (HELPER)
    // ================================
    
    /**
     * @dev Internal function untuk kalkulasi reward
     * Internal functions hanya bisa dipanggil dari dalam contract
     */
    function _calculateReward(address user, uint256 baseAmount) 
        internal 
        view 
        returns (uint256) 
    {
        uint256 reputation = users[user].reputation;
        uint256 multiplier = reputation / 100; // 1% per 100 reputation
        
        return baseAmount + (baseAmount * multiplier / 100);
    }
    
    /**
     * @dev Internal function untuk validasi transaksi
     */
    function _validateTransaction(address from, address to, uint256 amount) 
        internal 
        view 
        returns (bool) 
    {
        if (from == address(0) || to == address(0)) return false;
        if (amount == 0) return false;
        if (balances[from] < amount) return false;
        if (users[from].status != UserStatus.Active) return false;
        
        return true;
    }
    
    // ================================
    // PRIVATE FUNCTIONS (MOST RESTRICTED)
    // ================================
    
    /**
     * @dev Private function untuk internal calculations
     * Private functions hanya bisa dipanggil dari contract ini saja
     */
    function _updateUserMetrics(address user) private {
        users[user].metadata["lastActivity"] = block.timestamp;
        users[user].reputation += 1; // Small reputation boost
    }
    
    // ================================
    // FALLBACK & RECEIVE FUNCTIONS
    // ================================
    
    /**
     * @dev Receive function untuk menerima ether tanpa data
     * Dipanggil ketika ether dikirim ke contract tanpa function call
     */
    receive() external payable {
        require(msg.value > 0, "Must send ether");
        // Add to contract balance automatically
        emit BalanceUpdated(address(this), address(this).balance - msg.value, address(this).balance);
    }
    
    /**
     * @dev Fallback function untuk handle calls ke function yang tidak ada
     * Dipanggil ketika function yang dipanggil tidak ditemukan
     */
    fallback() external payable {
        revert("Function not found");
    }
    
    // ================================
    // ARRAY & MAPPING UTILITY FUNCTIONS
    // ================================
    
    /**
     * @dev Function untuk mendapatkan semua transaksi user
     */
    function getUserTransactions(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userTransactions[user];
    }
    
    /**
     * @dev Function untuk mendapatkan user metadata
     */
    function getUserMetadata(address user, string memory key) 
        external 
        view 
        returns (uint256) 
    {
        return users[user].metadata[key];
    }
    
    /**
     * @dev Function untuk mendapatkan semua whitelisted users
     */
    function getWhitelistedUsers() external view returns (address[] memory) {
        return whitelistedUsers;
    }
    
    /**
     * @dev Function untuk mengecek apakah product tersedia
     */
    function isProductAvailable(uint256 productId) external view returns (bool) {
        return products[productId].isAvailable && products[productId].seller != address(0);
    }
    
    // ================================
    // ADVANCED PATTERNS
    // ================================
    
    /**
     * @dev Function dengan try-catch untuk external calls
     * Demonstrasi error handling yang advanced
     */
    function safeExternalCall(address target, bytes memory data) 
        external 
        onlyOwner 
        returns (bool success, bytes memory result) 
    {
        try this.externalCall(target, data) returns (bytes memory returnData) {
            return (true, returnData);
        } catch Error(string memory reason) {
            // Revert dengan error message
            return (false, abi.encodePacked(reason));
        } catch (bytes memory lowLevelData) {
            // Revert tanpa error message
            return (false, lowLevelData);
        }
    }
    
    /**
     * @dev Helper function untuk external calls
     */
    function externalCall(address target, bytes memory data) 
        external 
        returns (bytes memory) 
    {
        (bool success, bytes memory result) = target.call(data);
        require(success, "External call failed");
        return result;
    }
    
    // ================================
    // GETTER FUNCTIONS UNTUK COMPLEX DATA
    // ================================
    
    /**
     * @dev Function untuk mendapatkan product tags
     */
    function getProductTags(uint256 productId) 
        external 
        view 
        returns (string[] memory) 
    {
        return products[productId].tags;
    }
    
    /**
     * @dev Function untuk mendapatkan contract version info
     */
    function getVersionInfo() 
        external 
        pure 
        returns (string memory version, uint256 decimals, uint256 maxSupply) 
    {
        return (VERSION, DECIMALS, MAX_SUPPLY);
    }
    
    /**
     * @dev Function untuk debugging - hanya untuk development
     */
    function getDebugInfo() 
        external 
        view 
        onlyOwner 
        returns (
            uint256 blockNumber,
            uint256 blockTimestamp,
            address msgSender,
            uint256 contractBalance,
            uint256 gasLeft
        ) 
    {
        return (
            block.number,
            block.timestamp,
            msg.sender,
            address(this).balance,
            gasleft()
        );
    }
}

/**
 * @title RewardSystem
 * @dev Contract terpisah yang mengimplementasikan interface
 * Demonstrasi konsep interface implementation
 */
contract RewardSystem is IRewardSystem {
    mapping(address => uint256) public userRewards;
    address public mainContract;
    
    constructor(address _mainContract) {
        mainContract = _mainContract;
    }
    
    modifier onlyMainContract() {
        require(msg.sender == mainContract, "Only main contract can call");
        _;
    }
    
    function calculateReward(address user, uint256 amount) 
        external 
        view 
        override 
        returns (uint256) 
    {
        // Simple reward calculation: 1% of amount
        return amount / 100;
    }
    
    function distributeReward(address user, uint256 reward) 
        external 
        override 
        onlyMainContract 
    {
        userRewards[user] += reward;
    }
}
