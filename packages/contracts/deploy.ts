import { ethers } from "hardhat"

async function main() {
  console.log("Deploying SpectrumMarket contract...")
  
  const SpectrumMarket = await ethers.getContractFactory("SpectrumMarket")
  const contract = await SpectrumMarket.deploy()
  
  await contract.waitForDeployment()
  const address = await contract.getAddress()
  
  console.log(`✅ SpectrumMarket deployed to: ${address}`)
  console.log(`Save this address for simulator and provider!`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
