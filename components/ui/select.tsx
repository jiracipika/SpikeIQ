"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const SELECT_TRIGGER = Symbol("SelectTrigger");
const SELECT_ITEM = Symbol("SelectItem");

type TaggedComponent = React.FC<any> & { __selectRole?: symbol };

function walk(
  node: React.ReactNode,
  visit: (element: React.ReactElement) => void,
): void {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return;
    visit(child);
    if ((child.props as { children?: React.ReactNode } | null)?.children) {
      walk((child.props as { children?: React.ReactNode }).children, visit);
    }
  });
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}

function Select({ value, onValueChange, children, disabled, ...rest }: SelectProps) {
  const items: Array<{ value: string; label: React.ReactNode }> = [];
  let triggerClassName: string | undefined;

  walk(children, (element) => {
    const role = (element.type as TaggedComponent).__selectRole;
    if (role === SELECT_TRIGGER && !triggerClassName) {
      triggerClassName = (element.props as { className?: string }).className;
    } else if (role === SELECT_ITEM) {
      const props = element.props as { value: string; children: React.ReactNode };
      items.push({ value: props.value, label: props.children });
    }
  });

  return (
    <select
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
      disabled={disabled}
      className={cn(
        "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
        triggerClassName,
      )}
      {...rest}
    >
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

const SelectTrigger: TaggedComponent = () => null;
SelectTrigger.__selectRole = SELECT_TRIGGER;
SelectTrigger.displayName = "SelectTrigger";

const SelectValue: TaggedComponent = () => null;
SelectValue.displayName = "SelectValue";

const SelectContent: TaggedComponent = ({ children }) => <>{children}</>;
SelectContent.displayName = "SelectContent";

const SelectItem: TaggedComponent = () => null;
SelectItem.__selectRole = SELECT_ITEM;
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
