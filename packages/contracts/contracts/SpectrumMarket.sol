// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SpectrumMarket
 * @notice Decentralized marketplace for RF spectrum access grants
 * @dev Providers grant/revoke spectrum access based on real-time signal quality data
 * @dev Optimized with struct packing for gas efficiency
 */
contract SpectrumMarket {
    
    // Struct packing: fits in 2 storage slots instead of 4 (saves gas)
    struct Grant {
        address provider;       // 20 bytes - slot 0
        uint96 paidAmount;      // 12 bytes - slot 0 (packed with provider)
        uint32 frequency;       // 4 bytes - slot 1 (frequency in MHz, max 4.2B MHz = 4.2 EHz)
        uint32 expiresAt;       // 4 bytes - slot 1 (packed, timestamp until year 2106)
    }
    
    // Contract owner (for withdrawals)
    address public immutable owner;
    
    // deviceId => Grant
    mapping(bytes32 => Grant) public activeGrants;
    
    // Track total funds collected
    uint256 public totalCollected;
    
    // Events
    event AccessGranted(
        bytes32 indexed deviceId,
        uint32 frequency,
        uint32 duration,
        uint96 amount,
        address indexed provider,
        uint256 timestamp
    );
    
    event AccessRevoked(
        bytes32 indexed deviceId,
        address indexed provider,
        uint256 timestamp
    );
    
    event FundsWithdrawn(
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );
    
    // Errors (gas efficient)
    error InsufficientPayment();
    error InvalidDuration();
    error InvalidFrequency();
    error NotProvider();
    error GrantExpired();
    error WithdrawFailed();
    error OnlyOwner();
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @notice Grant spectrum access to a device
     * @param deviceId Unique identifier for the device (bytes32)
     * @param frequency RF frequency in MHz (e.g., 2400 for 2.4 GHz)
     * @param duration Access duration in seconds
     */
    function grantAccess(
        bytes32 deviceId,
        uint32 frequency,
        uint32 duration
    ) external payable {
        if (msg.value < 0.001 ether) revert InsufficientPayment();
        if (duration == 0 || duration > 3600) revert InvalidDuration(); // Max 1 hour
        if (frequency == 0) revert InvalidFrequency();
        
        uint96 amount = uint96(msg.value); // Safe: msg.value is always < 2^96
        
        activeGrants[deviceId] = Grant({
            provider: msg.sender,
            paidAmount: amount,
            frequency: frequency,
            expiresAt: uint32(block.timestamp + duration) // Safe until year 2106
        });
        
        totalCollected += msg.value;
        
        emit AccessGranted(
            deviceId,
            frequency,
            duration,
            amount,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @notice Revoke spectrum access from a device
     * @param deviceId Unique identifier for the device
     */
    function revokeAccess(bytes32 deviceId) external {
        Grant memory grant = activeGrants[deviceId];
        if (grant.provider != msg.sender) revert NotProvider();
        if (grant.expiresAt <= block.timestamp) revert GrantExpired();
        
        delete activeGrants[deviceId];
        
        emit AccessRevoked(deviceId, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Check if a device can transmit on its granted frequency
     * @param deviceId Unique identifier for the device
     * @return bool True if device has active grant
     */
    function canTransmit(bytes32 deviceId) external view returns (bool) {
        Grant memory grant = activeGrants[deviceId];
        return grant.expiresAt > block.timestamp;
    }
    
    /**
     * @notice Get grant details for a device
     * @param deviceId Unique identifier for the device
     * @return Grant struct with all grant details
     */
    function getGrant(bytes32 deviceId) external view returns (Grant memory) {
        return activeGrants[deviceId];
    }
    
    /**
     * @notice Get grant expiration timestamp
     * @param deviceId Unique identifier for the device
     * @return uint32 Expiration timestamp (0 if no active grant)
     */
    function getGrantExpiration(bytes32 deviceId) external view returns (uint32) {
        return activeGrants[deviceId].expiresAt;
    }
    
    /**
     * @notice Withdraw accumulated funds (owner only)
     * @dev Critical: Allows recovery of funds paid by devices
     */
    function withdraw() external {
        if (msg.sender != owner) revert OnlyOwner();
        
        uint256 balance = address(this).balance;
        if (balance == 0) return;
        
        (bool success, ) = owner.call{value: balance}("");
        if (!success) revert WithdrawFailed();
        
        emit FundsWithdrawn(owner, balance, block.timestamp);
    }
    
    /**
     * @notice Get contract balance
     * @return uint256 Current balance in wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice Emergency withdrawal in case withdraw() fails
     * @dev Only callable by owner
     */
    function emergencyWithdraw() external {
        if (msg.sender != owner) revert OnlyOwner();
        
        // Force send using selfdestruct alternative (post-Cancun)
        payable(owner).transfer(address(this).balance);
    }
}
