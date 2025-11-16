"use client";

import { Crepe } from "@milkdown/crepe";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";

const CrepeEditor: React.FC = () => {
  const { get } = useEditor((root) => {
    return new Crepe({
      root,
      features: {
        "image-block": false,
        table: false,
      },
    });
  });

  return <Milkdown />;
};

export const RichTextEditor: React.FC = () => {
  return (
    <MilkdownProvider>
      <CrepeEditor />
    </MilkdownProvider>
  );
};
