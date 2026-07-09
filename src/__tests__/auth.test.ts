/**
 * Tests for auth.ts
 * Verifies password hashing, JWT generation/verification, and login flow.
 */
import { hashPassword, verifyPassword, generateToken, verifyToken } from "@/lib/auth";

describe("Authentication Service", () => {
  describe("hashPassword() + verifyPassword()", () => {
    it("should hash a password (not return plaintext)", async () => {
      const hash = await hashPassword("mypassword123");
      expect(hash).not.toBe("mypassword123");
      expect(hash.length).toBeGreaterThan(20);
    });

    it("should verify correct password", async () => {
      const hash = await hashPassword("test123");
      const valid = await verifyPassword("test123", hash);
      expect(valid).toBe(true);
    });

    it("should reject wrong password", async () => {
      const hash = await hashPassword("correct");
      const valid = await verifyPassword("wrong", hash);
      expect(valid).toBe(false);
    });

    it("should produce different hashes for same password (salt)", async () => {
      const hash1 = await hashPassword("same");
      const hash2 = await hashPassword("same");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("generateToken() + verifyToken()", () => {
    it("should generate a JWT token", () => {
      const token = generateToken({ id: "u1", email: "test@test.com", role: "doctor" });
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should verify a valid token", () => {
      const token = generateToken({ id: "u1", email: "test@test.com", role: "admin" });
      const payload = verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload!.sub).toBe("u1");
      expect(payload!.email).toBe("test@test.com");
      expect(payload!.role).toBe("admin");
    });

    it("should reject invalid token", () => {
      const payload = verifyToken("invalid.token.here");
      expect(payload).toBeNull();
    });

    it("should reject tampered token", () => {
      const token = generateToken({ id: "u1", email: "test@test.com", role: "doctor" });
      const tampered = token.slice(0, -5) + "XXXXX";
      const payload = verifyToken(tampered);
      expect(payload).toBeNull();
    });
  });
});
