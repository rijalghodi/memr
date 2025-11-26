"use client";

import { ArrowDownUp, ListFilter, Plus } from "lucide-react";
import { useState } from "react";

import { getRandomColor } from "@/lib/color";
import { getRoute, ROUTES } from "@/lib/routes";
import { collectionApiHook, useGetCollections } from "@/service/local/api-collection";

import { useBrowserNavigate } from "../browser-navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui";
import { Button } from "../ui/button";
import { DropdownFilter } from "../ui/drropdown-filter";
import { CollectionEmpty } from "./collection-empty";
import { CollectionItem } from "./collection-item";

type SortByValue = "updatedAt" | "viewedAt" | "createdAt";

export function CollectionDashboard() {
  const [sortBy, setSortBy] = useState<SortByValue | undefined>();
  const { navigate } = useBrowserNavigate();
  const { data: collections, isLoading } = useGetCollections({ sortBy });

  const handleSortChange = (value?: SortByValue) => {
    setSortBy(value);
  };

  const { mutate: createCollection } = collectionApiHook.useCreateCollection({
    onSuccess: (data) => {
      navigate(getRoute(ROUTES.COLLECTION, { collectionId: data.id }));
    },
  });

  const handleAddCollection = () => {
    createCollection({
      title: "",
      color: getRandomColor(),
    });
  };

  return (
    <div className="pt-6 space-y-4">
      {/* Header */}
      <Collapsible key="collection-filter-collapsible">
        <div className="px-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold">Collections</h1>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ListFilter />
                </Button>
              </CollapsibleTrigger>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="icon"
                className="rounded-full"
                onClick={handleAddCollection}
              >
                <Plus />
              </Button>
            </div>
          </div>
          <CollapsibleContent>
            <div className="flex items-center">
              <CollectionSort value={sortBy} onValueChange={handleSortChange} />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
      {/* Content */}
      <div
        data-slot="content"
        className="pb-6 animate-in fade-in slide-in-from-bottom-3 duration-500"
      >
        {isLoading ? null : collections.length === 0 ? (
          <CollectionEmpty onAddCollection={handleAddCollection} />
        ) : (
          <ul className="flex flex-col">
            {collections.map((collection) => (
              <CollectionItem key={collection.id} {...collection} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type CollectionSortProps = {
  value?: SortByValue;
  onValueChange: (value?: SortByValue) => void;
};

function CollectionSort({ value, onValueChange }: CollectionSortProps) {
  return (
    <DropdownFilter
      variant="secondary"
      className="rounded-full px-4"
      value={value}
      onValueChange={(value) => onValueChange(value as SortByValue)}
      icon={<ArrowDownUp />}
      placeholder="Sort by"
      options={[
        {
          label: "Last Modified",
          value: "updatedAt",
        },
        {
          label: "Last Created",
          value: "createdAt",
        },
      ]}
    />
  );
}
