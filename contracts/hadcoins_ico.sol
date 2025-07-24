pragma solidity ^0.8.0;

contract hadcoin_ico {
    uint public max_hadcoins = 1000000; // Maximum number of Hadcoins
    uint public usd_to_hadcoin = 1000; // 1 Hadcoin = 1000 USD
    uint public total_hadcoins_sold = 0; // Total Hadcoins sold
    mapping(address => uint) equity_hadcoins; // Mapping of addresses to their Hadcoin equity
    mapping(address => uint) equity_usd; // Mapping of addresses to their USD equity

    modifier can_buy_hadcoins(uint usd_amount) {
        require(usd_amount > 0, "USD amount must be greater than 0");
        require(total_hadcoins_sold + (usd_amount / usd_to_hadcoin) <= max_hadcoins, "Not enough Hadcoins available");
        _;
    }
}