import mongoose from "mongoose";
import crypto from "node:crypto";

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    // SHA-256 hash of the raw token — raw value is never stored
    tokenHash: {
      type:     String,
      required: true,
      unique:   true,
    },
    expiresAt: {
      type:     Date,
      required: true,
    },
    revoked: {
      type:    Boolean,
      default: false,
    },
    revokedAt: {
      type:    Date,
      default: null,
    },
    userAgent: { type: String, default: "" },
    ip:        { type: String, default: "" },
  },
  { timestamps: true }
);

// MongoDB TTL: automatically delete documents after expiresAt
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1, revoked: 1 });

/** Hash a raw token with SHA-256 */
refreshTokenSchema.statics.hash = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");

/** Generate a cryptographically random 64-hex-char token */
refreshTokenSchema.statics.generate = () =>
  crypto.randomBytes(32).toString("hex");

/** Revoke all active tokens for a user (logout-everywhere) */
refreshTokenSchema.statics.revokeAll = function (userId) {
  return this.updateMany(
    { user: userId, revoked: false },
    { $set: { revoked: true, revokedAt: new Date() } }
  );
};

export default mongoose.model("RefreshToken", refreshTokenSchema);