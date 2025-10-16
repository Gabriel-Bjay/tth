import bcrypt from "bcryptjs";

const password = "testuser";
const hash = "$2b$10$v5expC8bvuEPTvNtXjca1O7NV1ObFzK/yjBSFNj.RZ8PVJqgM5HlS"; // paste the real one here

const match = await bcrypt.compare(password, hash);
console.log("Match?", match);