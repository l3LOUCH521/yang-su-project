import type { PropsWithChildren } from "react";
import { Content } from "../Content";
import { LeftMenu } from "../Menu/LeftMenu";
import { TopMenu } from "./TopMenu";

export function AppLayout({
  children,
  query,
  selectedCategory,
  selectedTag,
  selectedYear,
  selectedMonth,
}: PropsWithChildren<{
  query?: string;
  selectedCategory?: string;
  selectedTag?: string;
  selectedYear?: string;
  selectedMonth?: string;
}>) {
  return (
    //add background color and min height to ensure the layout covers the whole screen
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      <LeftMenu
      //pass selected filters as props to LeftMenu, so it can highlight the active filter
        selectedCategory={selectedCategory}
        selectedTag={selectedTag}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
      />
      <div className="flex-1 flex flex-col">
        <TopMenu query={query} />
        <Content>{children}</Content>
      </div>
    </div>
  );
}