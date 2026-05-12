"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ThemeSwitch from "../Themes/ThemeSwitcher";

function debounce<T extends (...args: any[]) => any>(callback: T, delay = 300) {
  // Create an empty memory slot to hold our timer
  let timeoutId: NodeJS.Timeout;
  
  // Return a new protected version of the function
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    // If the timer was already running delete the old timer
    clearTimeout(timeoutId);
    
    // Start a brand new countdown timer. Only run the code if it survives [delay] milliseconds without being deleted.
    timeoutId = setTimeout(() => callback.apply(this, args), delay);
  };
}

/**
 * Top menu navigation component that provides a search bar and theme switching.
 * It handles search input with real-time debounced updates and form submission,
 * routing the user to a search page or back to the home page based on input.
 */
export function TopMenu({ query }: { query?: string }) {
  const router = useRouter();
  // create a state to track current text in the search bar
  //  Initialize it with the "query" from the URL, or an empty string if there is no query.
  const [searchValue, setSearchValue] = useState(query || "");

 
  // add debounce to search function, only trigger it after user stop typinf for 300ms
  const handleSearch = debounce((search: string) => {
    if (search.trim()) {
      // if theres something in the search bar, navigate to that serach page
      router.push(`/search?q=${encodeURIComponent(search)}`);
    } else {
      // if the search bar is empty, navigate back to the homepage
      router.push("/");
    }
  }, 300);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // update the searchValue state with the latest text from the search box
    setSearchValue(value);
    // trigger debounced function
    handleSearch(value); 
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // prevent the default form submission
    e.preventDefault();
    const trimmedValue = searchValue.trim();
    // if theres something in the search bar, navigate to that serach page
    if (trimmedValue) {
      router.push(`/search?q=${encodeURIComponent(trimmedValue)}`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSubmit} className="grid flex-1 grid-cols-1">
          <input
            type="text"
            name="searchQuery"
            value={searchValue}
            onChange={onChange}
            placeholder="Search"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>
      <div className="flex items-center gap-x-6">
        <ThemeSwitch />
      </div>
    </div>
  );
}