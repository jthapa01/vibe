import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { type TreeItem } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a record of files to a tree structure.
 * @param files - Record of file paths to content
 * @returns Tree structure for TreeView component
 *
 * @example
 * Input: { "src/Button.tsx": "...", "README.md": "..." }
 * Output: [["src", "Button.tsx"], "README.md"]
 */
export function convertFilesToTreeItems(
  files: Record<string, string>
): TreeItem[] {
  // Define proper type for tree structure
  interface TreeNode {
    [key: string]: TreeNode | null;
  }

  // Build the tree structure
  const tree: TreeNode = {};

  // Sort files to ensure consistent ordering
  const sortedFilePaths = Object.keys(files).sort();

  for (const filePath of sortedFilePaths) {
    const parts = filePath.split("/");
    let currentNode = tree;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!currentNode[part]) {
        currentNode[part] = {};
      }
      currentNode = currentNode[part] as TreeNode;
    }

    currentNode[parts[parts.length - 1]] = null;
  }

  // Convert tree structure to TreeItem format
  function convertNode(node: TreeNode, name?: string): TreeItem[] | TreeItem {
    // Get all key-value pairs from the current node
    // Example: { "components": {...}, "utils.ts": null }
    // becomes: [["components", {...}], ["utils.ts", null]]
    const entries = Object.entries(node);

    // Handle empty node case
    if (entries.length === 0) {
      return name || "";
    }

    const children: TreeItem[] = [];

    // Process each entry in the node
    entries.forEach(([key, value]) => {
      if (value === null) {
        // File: add as simple string
        // Example: "Button.tsx" gets added as just "Button.tsx"
        children.push(key);
      } else {
        // VALUE IS OBJECT = This is a FOLDER
        // Recursively process the folder contents
        const subTree = convertNode(value, key);
        // Create folder structure: [folderName, ...contents]
        const folderItem: TreeItem = Array.isArray(subTree)
          ? [key, ...subTree]
          : [key, subTree];
        children.push(folderItem);
      }
    });

    return children;
  }

  const result = convertNode(tree);
  return Array.isArray(result) ? result : [result];
}

// 📁 Root TreeNode
// ├── 📁 src (TreeNode)
// │   ├── 📁 components (TreeNode)
// │   │   ├── 📄 Button.tsx (null)
// │   │   └── 📄 Input.tsx (null)
// │   ├── 📁 utils (TreeNode)
// │   │   └── 📄 helpers.ts (null)
// │   └── 📄 app.ts (null)
// ├── 📄 package.json (null)
// └── 📄 README.md (null)
