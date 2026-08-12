"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { IconChevron } from "@/components/icons";
import { hierarchy, childCount, type Node } from "@/lib/data";

function TreeNode({ node, depth }: { node: Node; depth: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasKids = !!node.children?.length;
  return (
    <div className="tree-node">
      <div className={`tree-row${open ? " open" : ""}`} onClick={hasKids ? () => setOpen((o) => !o) : undefined} style={hasKids ? undefined : { cursor: "default" }}>
        {hasKids ? <IconChevron className="chev" width={16} height={16} /> : <span style={{ width: 16 }} />}
        <span className="kind">{node.kind}</span><span className="label">{node.label}</span>
        <span className="spacer" />
        {node.kind === "Parish"
          ? <><span className="slug-tag">/{node.slug}</span> <Badge state={node.sub!} /> <span className="count">{node.count}</span></>
          : <span className="count">{childCount(node)}</span>}
      </div>
      {hasKids && open ? <div className="tree-children">{node.children!.map((ch, i) => <TreeNode key={i} node={ch} depth={depth + 1} />)}</div> : null}
    </div>
  );
}

export function Hierarchy() {
  return (
    <>
      <div className="page-head"><h1>Hierarchy</h1><p>Browse the archdiocese top-down: Region &rarr; Deanery &rarr; Parish, each with its live subscription state.</p></div>
      <div className="card panel">{hierarchy.map((n, i) => <TreeNode key={i} node={n} depth={0} />)}</div>
    </>
  );
}
