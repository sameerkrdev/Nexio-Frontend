#!/usr/bin/env node

/**
 * Helper script to get your local IP address for API configuration
 * Run: node scripts/get-local-ip.js
 */

const os = require("os");

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        addresses.push({
          interface: name,
          address: iface.address,
        });
      }
    }
  }

  return addresses;
}

console.log("\n📱 Local IP Addresses for API Configuration\n");
console.log("═".repeat(50));

const addresses = getLocalIpAddress();

if (addresses.length === 0) {
  console.log("\n❌ No network interfaces found");
  console.log("Make sure you are connected to a network\n");
  process.exit(1);
}

addresses.forEach(({ interface: name, address }) => {
  console.log(`\n${name}:`);
  console.log(`  IP: ${address}`);
  console.log(`  API URL: http://${address}:3000/api/v1`);
});

console.log("\n" + "═".repeat(50));
console.log("\n💡 Usage:");
console.log("1. Copy one of the API URLs above");
console.log("2. Open client/config/api.config.ts");
console.log("3. Update API_BASE_URL with the copied URL");
console.log("4. Make sure your backend is running on port 3000\n");

console.log("📝 Quick Reference:");
console.log("  iOS Simulator:      http://localhost:3000/api/v1");
console.log("  Android Emulator:   http://10.0.2.2:3000/api/v1");
console.log("  Physical Device:    Use one of the IPs above\n");
