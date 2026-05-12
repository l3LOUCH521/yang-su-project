import { type Post } from "@repo/db/data";
import { LinkList } from "./LinkList";
import { SummaryItem } from "./SummaryItem";
import { history } from "@/functions/history";

const months = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function HistoryList({
  selectedYear,
  selectedMonth,
  posts,
}: {
  selectedYear?: string;
  selectedMonth?: string;
  posts: Post[];
}) {
  // find out if an archive link should be highlighted as "selected".
  const isSelected = (year: number, month: number) => {
    // If no filter is active, nothing is selected
    if (!selectedYear || !selectedMonth) return false;
    
    // Map numeric month from the grouping function back to a string name
    const monthName = months[month];
    
    // Match against the strings passed in through the URL parameters
    return year.toString() === selectedYear && monthName === selectedMonth;
  };

  // Generate the grouped data containing {count, month, year} based on the raw posts array
  const historyItems = history(posts);

  return (
    <LinkList title="History">
      {historyItems.map((item) => {
        // Construct the display name for the list item, e.g., "April, 2022"
        const name = `${months[item.month]}, ${item.year}`;
        
        return (
          <SummaryItem
            key={`${item.year}-${item.month}`}
            count={item.count}
            name={name}
            isSelected={isSelected(item.year, item.month)}
            link={`/history/${item.year}/${item.month}`}
            title={`History / ${name}`}
          />
        );
      })}
    </LinkList>
  );
}