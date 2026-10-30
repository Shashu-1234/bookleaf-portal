import { describe, expect, it } from "vitest";

import { adminTickets } from "./mock-data";
import { filterAndSortTickets, type TicketQueueFilters } from "./ticket-queue-model";

const allFilters: TicketQueueFilters = {
  search: "",
  status: "All",
  category: "All",
  priority: "All",
  age: "All",
  assignment: "All",
};

describe("filterAndSortTickets", () => {
  it("puts unresolved critical tickets first, then older tickets within a priority", () => {
    const result = filterAndSortTickets(adminTickets, allFilters);
    expect(result.slice(0, 3).map((entry) => entry.id)).toEqual([
      "BL-1048",
      "BL-1044",
      "BL-1047",
    ]);
    expect(
      result.slice(-2).every((entry) => entry.status === "Resolved" || entry.status === "Closed"),
    ).toBe(true);
  });

  it("searches masked ISBNs without altering the sample data", () => {
    const result = filterAndSortTickets(adminTickets, {
      ...allFilters,
      search: "978-93-5xxxx-17-2",
    });
    expect(result.map((entry) => entry.id)).toEqual(["BL-1047"]);
  });

  it("combines category, assignment, and date filters", () => {
    const result = filterAndSortTickets(adminTickets, {
      ...allFilters,
      category: "Royalty & Payments",
      assignment: "Unassigned",
      age: "3d",
    });
    expect(result.map((entry) => entry.id)).toEqual(["BL-1048"]);
  });
});
