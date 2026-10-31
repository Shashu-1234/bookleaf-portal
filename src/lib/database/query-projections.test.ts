import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const repositoryFiles = [
  "author-repository.ts",
  "admin-repository.ts",
  "ai-repository.ts",
];

function repositorySource(file: string) {
  return readFileSync(resolve(process.cwd(), "src", "lib", "database", file), "utf8");
}

describe("database query projections", () => {
  it.each(repositoryFiles)("does not use wildcard projections in %s", (file) => {
    const source = repositorySource(file);

    expect(source).not.toMatch(/\.select\(\s*["'`]\s*\*/);
    expect(source).not.toMatch(/\b(?:authors|books|ai_runs|ticket_messages|internal_notes)\(\*\)/);
  });

  it("keeps author reads separated by screen boundary", () => {
    const source = repositorySource("author-repository.ts");

    for (const query of [
      "getAuthorShellProfile",
      "getAuthorDashboardData",
      "getAuthorCatalogue",
      "getAuthorRoyalties",
      "getAuthorSupportData",
      "getAuthorBookOptions",
      "getAuthorTicketByCode",
    ]) {
      expect(source).toContain(query);
    }
    expect(source).not.toContain("getAuthorPortalData");
  });

  it("keeps admin overview, queue, and detail reads independent", () => {
    const source = repositorySource("admin-repository.ts");

    expect(source).toContain("getAdminOverviewData");
    expect(source).toContain("getAdminTicketQueue");
    expect(source).toContain("getAdminTicketByCode");
    expect(source).not.toContain("getAdminPortalData");
  });
});
