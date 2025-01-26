import { describe, expect, test } from "vitest";
import { toCamelCase } from "../../src/build-theme/utils.js";

describe("Utils tests", () => {
  describe("toCamelCase", () => {
    test.each([
      ["email-test", "emailTest"],
      ["event-update_totp", "eventUpdateTotp"],
      [
        "event-user_disabled_by_temporary_lockout",
        "eventUserDisabledByTemporaryLockout",
      ],
      ["executeActions", "executeActions"],
      ["sTranGe-Custom-eMAIl", "strangeCustomEmail"],
      ["org-invite", "orgInvite"],
      ["password-reset", "passwordReset"],
    ])("should convert %s to %s", (source, result) => {
      expect(toCamelCase(source)).toBe(result);
    });
  });
});
