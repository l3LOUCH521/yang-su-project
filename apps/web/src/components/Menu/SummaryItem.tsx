export function SummaryItem({
  name, //display name of the list item
  link, //href link to the item
  count, //number of posts associated with the item
  isSelected, //determining if this item is the currently active route
  title,
}: {
  name: string;
  link: string;
  count: number;
  isSelected: boolean;
  title?: string;
}) {
  // using title if provied, otherwise use name and count
  const itemTitle = title || `${name} (${count})`;

  return (
    <li>
      <a
        href={link}
        title={itemTitle}
        className={`flex justify-between items-center px-3 py-2 text-sm font-semibold leading-6 rounded-md ${
          isSelected
            ? "selected bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
        }`}
      >
        <span>{name}</span>
        <span data-test-id="post-count" className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 rounded-full">
          {count}
        </span>
      </a>
    </li>
  );
}