import TaskItem from "./TaskItem";

export default function TaskList({
  tasks,
  onToggle,
  onDelete,
  onUpdate = async () => {},
  memberLabels = {},
  canManageTasks = true,
}) {
  if (!tasks.length) {
    return (
      <div className="rounded-3xl bg-white/4 p-8 text-center text-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
        Plus aucune tache. Beau clean.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-5">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          taskId={task.id}
          title={task.title}
          description={task.description}
          dueDate={task.dueDate}
          priority={task.priority}
          completed={task.completed}
          addedBy={task.addedBy}
          addedByLabel={memberLabels[task.addedBy] || task.addedBy}
          canManageTasks={canManageTasks}
          onToggle={() => onToggle(task.id)}
          onDelete={() => onDelete(task.id)}
          onUpdate={(updates) => onUpdate(task.id, updates)}
        />
      ))}
    </div>
  );
}
