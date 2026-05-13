import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";
import { getBlackHoleMetrics } from "./lib/actions/blackhole";
import { Account } from "./models/Account";
import dbConnect from "./lib/mongodb";

async function run() {
  await dbConnect();
  const account = await Account.findOne();
  if (!account) {
    console.log("No account found");
    process.exit(0);
  }
  console.log("Testing account ID:", account._id.toString());
  const metrics = await getBlackHoleMetrics(account._id.toString());
  console.log("Metrics:", metrics);
  process.exit(0);
}

run().catch(console.error);
