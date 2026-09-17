import { describe, expectTypeOf, test } from "vitest";
import { createVariablesHelper } from "./create-variables-helper.js";

describe("createVariablesHelper type tests", () => {
  describe("org-invite.ftl", () => {
    const { exp, v } = createVariablesHelper("org-invite.ftl");

    test("accepts valid property paths", () => {
      expectTypeOf(exp("organization.name")).toBeString();
      expectTypeOf(exp("firstName")).toBeString();
      expectTypeOf(exp("lastName")).toBeString();
      expectTypeOf(exp("link")).toBeString();
      expectTypeOf(exp("linkExpiration")).toBeString();
      expectTypeOf(exp("linkExpirationFormatter(linkExpiration)")).toBeString();
    });

    test("accepts FreeMarker array access syntax", () => {
      expectTypeOf(exp("organization.attributes[0]")).toBeString();
    });

    test("accepts FreeMarker null-safe operator", () => {
      expectTypeOf(exp("firstName??")).toBeString();
      expectTypeOf(exp("organization.name??")).toBeString();
      expectTypeOf(exp("organization.attributes[0]??")).toBeString();
    });

    test("accepts FreeMarker fallback syntax", () => {
      expectTypeOf(exp("firstName!lastName")).toBeString();
      expectTypeOf(exp("organization.name!realmName")).toBeString();
      expectTypeOf(
        exp("organization.attributes[0]!organization.name"),
      ).toBeString();
    });

    test("accepts FreeMarker grouped fallback syntax", () => {
      expectTypeOf(exp("(firstName)!lastName")).toBeString();
      expectTypeOf(
        exp("(organization.attributes[0])!organization.name"),
      ).toBeString();
    });

    test("v() accepts the same patterns as exp()", () => {
      expectTypeOf(v("organization.name")).toBeString();
      expectTypeOf(v("firstName!lastName")).toBeString();
      expectTypeOf(v("(firstName)!lastName")).toBeString();
    });

    test("rejects invalid paths", () => {
      // @ts-expect-error - "invalid" is not a valid path
      exp("invalid");

      // @ts-expect-error - "typo.name" is not a valid path
      exp("typo.name");

      // @ts-expect-error - invalid path in array access
      exp("invalid[0]");

      // @ts-expect-error - invalid path in null-safe
      exp("invalid??");

      // @ts-expect-error - invalid path in fallback (first part)
      exp("invalid!firstName");

      // @ts-expect-error - invalid path in fallback (second part)
      exp("firstName!invalid");

      // @ts-expect-error - invalid path in grouped fallback
      exp("(invalid)!firstName");
    });
  });

  describe("email-verification.ftl", () => {
    const { exp } = createVariablesHelper("email-verification.ftl");

    test("accepts valid property paths", () => {
      expectTypeOf(exp("user.firstName")).toBeString();
      expectTypeOf(exp("user.lastName")).toBeString();
      expectTypeOf(exp("link")).toBeString();
      expectTypeOf(exp("realmName")).toBeString();
    });

    test("accepts FreeMarker expressions with valid paths", () => {
      expectTypeOf(exp("user.firstName!user.lastName")).toBeString();
      expectTypeOf(exp("user.firstName??")).toBeString();
    });

    test("rejects paths from other templates", () => {
      // @ts-expect-error - "organization" doesn't exist in email-verification
      exp("organization.name");
    });
  });

  describe("event-login_error.ftl", () => {
    const { exp } = createVariablesHelper("event-login_error.ftl");

    test("accepts valid event property paths", () => {
      expectTypeOf(exp("event.date")).toBeString();
      expectTypeOf(exp("event.ipAddress")).toBeString();
    });

    test("accepts event.details with any property (UnknownObject)", () => {
      expectTypeOf(exp("event.details.credential_type")).toBeString();
      expectTypeOf(
        exp("event.details.credential_type!event.details.fallback"),
      ).toBeString();
    });
  });
});
