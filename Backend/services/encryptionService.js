import crypto from "crypto";
import 'dotenv/config';

let key;
try {
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey && envKey.length === 64) {
    key = Buffer.from(envKey, "hex");
  } else if (envKey) {
    // if length is weird, hash it to get 32 bytes
    console.warn("ENCRYPTION_KEY length is not 64 hex characters. Hashing it to generate 32-byte key.");
    key = crypto.createHash('sha256').update(envKey).digest();
  } else {
    console.error("ENCRYPTION_KEY using random key (persistence lost on restart).");
    key = crypto.randomBytes(32);
  }
} catch (e) {
  console.error("Error setting up encryption key:", e);
  key = crypto.randomBytes(32);
}

export const encrypt = (text) => {
  try {
    if (!text) return text;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  } catch (e) {
    console.error("Encryption failed", e);
    return text; // Fallback to plain text
  }
};

export const decrypt = (encrypted) => {
  try {
    if (!encrypted || !encrypted.includes(":")) return encrypted;
    const [ivHex, data] = encrypted.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(data, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (e) {
    console.error("Decryption failed", e);
    return encrypted; // Fallback to original text
  }
};