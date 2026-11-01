import { describe, expect, it } from "vitest";

import { pageRange, paginationMeta, parsePage } from "./pagination";

describe("pagination", () => {
  it("normalizes unsafe page values", () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("invalid")).toBe(1);
    expect(parsePage("3")).toBe(3);
    expect(parsePage("999999")).toBe(10_000);
  });

  it("creates inclusive database ranges", () => {
    expect(pageRange(1, 10)).toEqual({ from: 0, to: 9 });
    expect(pageRange(3, 8)).toEqual({ from: 16, to: 23 });
  });

  it("keeps empty collections on a valid first page", () => {
    expect(paginationMeta(1, 10, 0)).toEqual({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
    expect(paginationMeta(2, 10, 21).totalPages).toBe(3);
  });
});
