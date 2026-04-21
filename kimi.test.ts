import { describe, expect, it } from "vitest";
import { callKimiAPI } from "./kimi";

describe("Kimi API Integration", () => {
  it("should successfully call Kimi API with valid credentials", async () => {
    // Simple test to verify API key is valid
    const response = await callKimiAPI([
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Say 'Hello' in one word." },
    ]);

    expect(response).toBeTruthy();
    expect(typeof response).toBe("string");
    expect(response.length).toBeGreaterThan(0);
  }, 30000); // 30 second timeout for API call
});
