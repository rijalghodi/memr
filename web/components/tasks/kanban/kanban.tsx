import React, { useCallback, useMemo, useState } from "react";
import { ReactSortable } from "react-sortablejs";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { generateBetweenRank } from "@/lib/fractional-idx";

import { List } from "./list";
import { TKanbanTask } from "./type";

// Group item for list reordering (ReactSortable requires objects with id)
export type GroupItem = { id: string; title: string };

// Helper function to group tasks by group
function groupTasksByGroup(
  tasks: TKanbanTask[]
): Record<string, TKanbanTask[]> {
  return tasks?.reduce(
    (acc, task) => {
      if (!acc[task.groupId]) {
        acc[task.groupId] = [];
      }
      acc[task.groupId].push(task);
      return acc;
    },
    {} as Record<string, TKanbanTask[]>
  );
}

type KanbanTaskProps = {
  tasks: TKanbanTask[];
  onTaskUpdate: (id: string, data: Partial<TKanbanTask>) => void;
  onTaskAdd: (groupId: string, data: TKanbanTask) => void;
  onTaskDelete: (id: string) => void;
  groups: GroupItem[];
};

// Main Kanban component
export function KanbanTask({
  tasks,
  onTaskUpdate,
  onTaskAdd,
  onTaskDelete: _onTaskDelete,
  groups,
}: KanbanTaskProps) {
  // Group tasks by group
  const tasksByGroup = useMemo(() => {
    return groupTasksByGroup(tasks);
  }, [tasks]);

  // Handle task drop within same list or between lists
  const handleTaskDrop = useCallback(
    (group: string, newTasks: TKanbanTask[], oldTasks: TKanbanTask[]) => {
      console.log(
        "handleTaskDrop",
        group,
        newTasks.map((t) => t.title + " " + t.sortOrder),
        oldTasks.map((t) => t.title + " " + t.sortOrder)
      );

      // Find tasks that were added (moved from another list)
      const addedTaskIdx = newTasks.findIndex(
        (task) => !oldTasks.some((t) => t.id === task.id)
      );
      const addedTask = newTasks[addedTaskIdx];

      // console.log("handleTaskDrop addedTask", addedTask);

      // Update group and sortOrder for tasks that were moved to this list
      if (addedTask) {
        // Find the insertion point: where the first added task is positioned
        // const firstAddedIndex = newTasks.findIndex((task) =>
        //   addedTasks.some((at) => at.id === task.id)
        // );
        // const lastAddedIndex = firstAddedIndex + addedTasks.length - 1;

        // Get the previous task (before insertion point) and next task (after insertion point)
        const prevTask = addedTaskIdx > 0 ? newTasks[addedTaskIdx - 1] : null;
        const nextTask =
          addedTaskIdx < newTasks.length - 1
            ? newTasks[addedTaskIdx + 1]
            : null;

        // Generate sortOrders for all added tasks at once
        const prevSortOrder = prevTask?.sortOrder || undefined;
        const nextSortOrder = nextTask?.sortOrder || undefined;
        const newSortOrder = generateBetweenRank(prevSortOrder, nextSortOrder);

        // Update each added task with its generated sortOrder
        onTaskUpdate(addedTask.id, {
          ...addedTask,
          groupId: group,
          sortOrder: newSortOrder,
        });
      }

      // Sort old tasks by sortOrder to get proper ordering
      // const sortedOldTasks = [...oldTasks].sort((a, b) => {
      //   const aOrder = a.sortOrder || "";
      //   const bOrder = b.sortOrder || "";
      //   return aOrder.localeCompare(bOrder);
      // });

      // console.log(
      //   "handleTaskDrop sortedOldTasks",
      //   sortedOldTasks.map((t) => t.title + " " + t.sortOrder)
      // );

      // update only prev, next task
      // find first moved task from oldTasks

      if (!addedTask) {
        console.log(
          "handleTaskDrop oldTasks",
          oldTasks.map((t) => t.title + "-" + t.sortOrder)
        );
        console.log(
          "handleTaskDrop newTasks",
          newTasks.map((t) => t.title + "-" + t.sortOrder)
        );

        const movedTaskIdx = newTasks.findIndex(
          (t, idx) => t.id !== oldTasks[idx].id
        );
        const movedTask = newTasks[movedTaskIdx];
        console.log(
          "handleTaskDrop movedTask",
          movedTask?.title + "-" + movedTask?.sortOrder
        );

        console.log("handleTaskDrop movedTaskIdx", movedTaskIdx);

        if (movedTaskIdx !== -1) {
          const movedTask = newTasks[movedTaskIdx];
          const prevTask = movedTaskIdx > 0 ? newTasks[movedTaskIdx - 1] : null;
          const nextTask =
            movedTaskIdx < newTasks.length - 1
              ? newTasks[movedTaskIdx + 1]
              : null;

          const prevSortOrder = prevTask?.sortOrder || undefined;
          const nextSortOrder = nextTask?.sortOrder || undefined;

          console.log(
            "handleTaskDrop order",
            prevTask?.title + "-" + prevTask?.sortOrder,
            movedTask.title + "-" + movedTask.sortOrder,
            nextTask?.title + "-" + nextTask?.sortOrder
          );

          const newSortOrder = generateBetweenRank(
            prevSortOrder,
            nextSortOrder
          );
          console.log("handleTaskDrop newSortOrder", newSortOrder);
          onTaskUpdate(movedTask.id, {
            ...movedTask,
            sortOrder: newSortOrder,
          });
        }
      }

      // Update sortOrder for tasks that were reordered within this list
      // newTasks.forEach((task, index) => {
      //   const oldIndex = oldTasks.findIndex((t) => t.id === task.id);
      //   if (oldIndex !== -1 && oldIndex !== index && task.groupId === group) {
      //     const prevTask = index > 0 ? newTasks[index - 1] : null;
      //     const nextTask =
      //       index < newTasks.length - 1 ? newTasks[index + 1] : null;

      //     // Generate sortOrder between previous and next task
      //     const prevSortOrder = prevTask?.sortOrder || undefined;
      //     const nextSortOrder = nextTask?.sortOrder || undefined;

      //     console.log(
      //       "handleTaskDrop ordered task",
      //       task.title + " " + task.sortOrder,
      //       prevSortOrder,
      //       nextSortOrder
      //     );

      //     const newSortOrder = generateBetweenRank(
      //       prevSortOrder,
      //       nextSortOrder
      //     );

      //     onTaskUpdate(task.id, {
      //       ...task,
      //       sortOrder: newSortOrder,
      //     });
      //   }
      // });
    },
    [onTaskUpdate]
  );

  // Handle task add
  const handleTaskAdd = useCallback(
    (groupId: string, taskData: TKanbanTask) => {
      // Get existing tasks for this group, sorted by sortOrder
      const groupTasks = tasks
        .filter((t) => t.groupId === groupId)
        .sort((a, b) => {
          const aOrder = a.sortOrder || "";
          const bOrder = b.sortOrder || "";
          return aOrder.localeCompare(bOrder);
        });

      // Generate sortOrder for new task (add at the end)
      const lastTask = groupTasks[groupTasks.length - 1];
      const lastSortOrder = lastTask?.sortOrder || undefined;
      const newSortOrder = generateBetweenRank(lastSortOrder, undefined);

      onTaskAdd(groupId, {
        ...taskData,
        sortOrder: newSortOrder,
      });
    },
    [onTaskAdd, tasks]
  );

  // Handle list reorder (group columns)
  const [groupOrderState, setGroupOrderState] = useState<GroupItem[]>(groups);

  const handleListReorder = useCallback((newOrder: GroupItem[]) => {
    setGroupOrderState(newOrder);
  }, []);

  // Update group order state when prop changes
  React.useEffect(() => {
    setGroupOrderState(groups);
  }, [groups]);

  return (
    <div id="kanban" className="h-full w-full flex flex-col">
      <ScrollArea className="flex-1 w-full">
        <div className="h-full">
          <ReactSortable
            list={groupOrderState}
            setList={handleListReorder}
            animation={200}
            handle=".list-title"
            direction="horizontal"
            className="flex gap-0 h-full"
          >
            {groupOrderState.map((groupItem) => {
              const groupTasks = tasksByGroup[groupItem.id] || [];
              return (
                <List
                  key={groupItem.id}
                  groupId={groupItem.id}
                  groupTitle={groupItem.title}
                  tasks={groupTasks}
                  onTaskDrop={handleTaskDrop}
                  onTaskAdd={handleTaskAdd}
                />
              );
            })}
          </ReactSortable>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
