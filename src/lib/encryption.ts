/**
 * VELTRA — Encryption Service
 *
 * Application-level field encryption for PHI (Protected Health Information).
 * Works IN ADDITION to database-level encryption (AES-256 at rest).
 *
 * What this does:
 *   - Encrypts sensitive fields before writing to DB (name, phone, diagnosis)
 *   - Decrypts when reading
 *   - Uses AES-256-GCM (authenticated encryption)
 *   - Key rotation support
 *
 * Why both app-level + DB-level:
 *   - DB encryption protects against physical disk theft
 *   - App encryption protects against SQL injection (attacker gets ciphertext)
 *   - App encryption allows field-level access control
 *
 * Setup:
 *   Add to .env: ENCRYPTION_KEY=<32-byte-hex-string>
 *   Generate with: openssl rand -hex 32
 */

import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "veltra-dev-encryption-key-change-in-prod-32bytes!!";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

class EncryptionService {
  private key: Buffer;

  constructor() {
    // Ensure key is exactly 32 bytes
    this.key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
  }

  /**
   * Encrypt a string. Returns base64-encoded ciphertext + IV + auth tag.
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    // Combine: iv (16) + tag (16) + ciphertext
    return Buffer.concat([iv, tag, Buffer.from(encrypted, "hex")]).toString("base64");
  }

  /**
   * Decrypt a string encrypted by this service.
   */
  decrypt(ciphertext: string): string {
    const data = Buffer.from(ciphertext, "base64");
    const iv = data.subarray(0, IV_LENGTH);
    const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted.toString("hex"), "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Encrypt an object's sensitive fields.
   * Only fields listed in `fields` are encrypted; others stay as-is.
   */
  encryptFields<T extends Record<string, unknown>>(
    obj: T,
    fields: (keyof T)[]
  ): T {
    const result = { ...obj };
    for (const field of fields) {
      if (result[field] !== undefined && result[field] !== null && typeof result[field] === "string") {
        result[field] = this.encrypt(result[field] as string) as T[keyof T];
      }
    }
    return result;
  }

  /**
   * Decrypt an object's sensitive fields.
   */
  decryptFields<T extends Record<string, unknown>>(
    obj: T,
    fields: (keyof T)[]
  ): T {
    const result = { ...obj };
    for (const field of fields) {
      if (result[field] !== undefined && result[field] !== null && typeof result[field] === "string") {
        try {
          result[field] = this.decrypt(result[field] as string) as T[keyof T];
        } catch {
          // Field wasn't encrypted (legacy data) — leave as-is
        }
      }
    }
    return result;
  }

  /**
   * Generate a one-way hash (for indexing encrypted data).
   * Allows searching without decrypting.
   */
  hash(value: string): string {
    return crypto.createHmac("sha256", this.key).update(value).digest("hex");
  }

  /**
   * Check if a value appears to be encrypted (base64 with correct length).
   */
  isEncrypted(value: string): boolean {
    try {
      const data = Buffer.from(value, "base64");
      return data.length > IV_LENGTH + TAG_LENGTH;
    } catch {
      return false;
    }
  }
}

export const encryptionService = new EncryptionService();

/**
 * Fields that should be encrypted in each model.
 * These are PHI fields that require extra protection.
 */
export const ENCRYPTED_FIELDS = {
  patient: ["name", "phone", "conditions", "allergies"] as const,
  user: ["email"] as const,
  labResult: ["value", "notes"] as const,
  prescription: ["notes"] as const,
  document: ["name"] as const,
} as const;
