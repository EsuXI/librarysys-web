import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import handler from "../../api/index.js";

test("Vercel API reports missing setup without attempting a database connection", async () => {
  const previousUri = process.env.MONGODB_URI;
  const previousSecret = process.env.JWT_SECRET;
  delete process.env.MONGODB_URI;
  delete process.env.JWT_SECRET;
  try {
    const app = express();
    app.use(handler);
    const response = await request(app).get("/api/health").expect(503);
    assert.equal(response.body.status, "setup_required");
    assert.equal(response.body.database, "not_configured");
    assert.equal(response.headers["cache-control"], "no-store");
    assert.equal(response.body.demo, false);
  } finally {
    if (previousUri !== undefined) process.env.MONGODB_URI = previousUri;
    if (previousSecret !== undefined) process.env.JWT_SECRET = previousSecret;
  }
});
