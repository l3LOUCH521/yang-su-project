import { seed } from "..dist/seed.js";

try {
    await seed();
    console.log("✅ Seed complete");
} catch (err) {
    console.error("❌ Seed failed");
    console.error(err);
    process.exit(1);
}
