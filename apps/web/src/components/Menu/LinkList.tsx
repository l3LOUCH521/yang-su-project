import type { PropsWithChildren } from "react";

export function LinkList(props: PropsWithChildren<{ title: string }>) {
  return (
    <div className="mb-1">
      <h2 className="text-xs font-semibold leading-5 text-gray-400 dark:text-gray-400 tracking-wider mb-3">
        {props.title}
      </h2>
      <ul>{props.children}</ul>
    </div>
  );
}