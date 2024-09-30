export function buildTree(data: any[], idField: string, parentField: string) {
  const nodeMap = new Map();

  // Initialize all nodes
  data.forEach((node) => {
    node.children = [];
    nodeMap.set(node[idField], node);
  });

  // Build the tree structure
  const tree: any[] = [];

  data.forEach((node) => {
    if (node[parentField]) {
      // Find the parent and add the node as a child
      const parent = nodeMap.get(node[parentField]);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      // No parentId means it's a root node
      tree.push(node);
    }
  });

  return tree;
}
