require('dotenv').config();
const dns = require("dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const { MongoClient } = require('mongodb');

const url = process.env.MONGODB_URI
const client = new MongoClient(url);

const dbName = process.env.MONGODB_DATABASE

async function main() {
  
  await client.connect();
  console.log('Connected successfully to server');
  console.log(dbName);
}

main()
  .then()
  .catch(console.error)
  .finally(() => client.close());