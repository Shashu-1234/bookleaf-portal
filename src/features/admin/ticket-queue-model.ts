import { priorityRank } from "./formatters";
import type { AdminTicketQueueItem } from "./types";

export interface TicketQueueFilters {
  search: string;
  status: string;
  category: string;
  priority: string;
  age: string;
  assignment: string;
}

export function filterAndSortTickets(
  tickets: AdminTicketQueueItem[],
  filters: TicketQueueFilters,
): AdminTicketQueueItem[] {
  const query = filters.search.trim().toLowerCase();
  const ageLimit =
    filters.age === "24h"
      ? 24
      : filters.age === "3d"
        ? 72
        : filters.age === "7d"
          ? 168
          : Infinity;

  return tickets
    .filter((entry) => {
      const values = [
        entry.id,
        entry.subject,
        entry.author.name,
        entry.author.email,
        entry.book?.title,
        entry.book?.isbn,
      ];
      const matchesSearch =
        !query ||
        values.filter(Boolean).some((value) => value?.toLowerCase().includes(query));
      const matchesAssignment =
        filters.assignment === "All" ||
        (filters.assignment === "Unassigned" && !entry.assignedTo) ||
        (filters.assignment === "Mine" && entry.assignedTo === "Aarav Mehta");

      return (
        matchesSearch &&
        (filters.status === "All" || entry.status === filters.status) &&
        (filters.category === "All" || entry.category === filters.category) &&
        (filters.priority === "All" || entry.priority === filters.priority) &&
        entry.ageHours <= ageLimit &&
        matchesAssignment
      );
    })
    .sort((a, b) => {
      const aDone = a.status === "Resolved" || a.status === "Closed";
      const bDone = b.status === "Resolved" || b.status === "Closed";
      if (aDone !== bDone) return aDone ? 1 : -1;
      return priorityRank[a.priority] - priorityRank[b.priority] || b.ageHours - a.ageHours;
    });
}
