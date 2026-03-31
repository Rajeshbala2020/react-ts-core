export function buildTree(data: any[], idField: string, parentField: string) {
  const nodeMap = new Map();

  data.forEach((node) => {
    nodeMap.set(node[idField], {
      ...node,
      checked: false,
      children: [],
    });
  });

  const tree: any[] = [];

  data.forEach((node) => {
    const currentNode = nodeMap.get(node[idField]);
    const parentId = node[parentField];
    const hasParent = parentId !== null && parentId !== undefined && parentId !== '';

    if (hasParent) {
      const parentNode = nodeMap.get(parentId);

      if (parentNode) {
        parentNode.children.push(currentNode);
        return;
      }
    }

    tree.push(currentNode);
  });

  return tree;
}
