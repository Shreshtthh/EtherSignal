export const SpectrumMarketABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "GrantExpired",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientPayment",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidDuration",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidFrequency",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotProvider",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OnlyOwner",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "WithdrawFailed",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "deviceId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "frequency",
          "type": "uint32"
        },
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "duration",
          "type": "uint32"
        },
        {
          "indexed": false,
          "internalType": "uint96",
          "name": "amount",
          "type": "uint96"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "provider",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "AccessGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "deviceId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "provider",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "AccessRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "FundsWithdrawn",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "activeGrants",
      "outputs": [
        {
          "internalType": "address",
          "name": "provider",
          "type": "address"
        },
        {
          "internalType": "uint96",
          "name": "paidAmount",
          "type": "uint96"
        },
        {
          "internalType": "uint32",
          "name": "frequency",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "expiresAt",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "deviceId",
          "type": "bytes32"
        }
      ],
      "name": "canTransmit",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "emergencyWithdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "deviceId",
          "type": "bytes32"
        }
      ],
      "name": "getGrant",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "provider",
              "type": "address"
            },
            {
              "internalType": "uint96",
              "name": "paidAmount",
              "type": "uint96"
            },
            {
              "internalType": "uint32",
              "name": "frequency",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "expiresAt",
              "type": "uint32"
            }
          ],
          "internalType": "struct SpectrumMarket.Grant",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "deviceId",
          "type": "bytes32"
        }
      ],
      "name": "getGrantExpiration",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "deviceId",
          "type": "bytes32"
        },
        {
          "internalType": "uint32",
          "name": "frequency",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "duration",
          "type": "uint32"
        }
      ],
      "name": "grantAccess",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "deviceId",
          "type": "bytes32"
        }
      ],
      "name": "revokeAccess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalCollected",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const
