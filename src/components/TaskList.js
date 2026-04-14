import TaskItem from "./TaskItem";

export default function TaskList({ tasks, onToggle, onDelete }) {
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
          title={task.title}
          description={task.description}
          date={task.date}
          priority={task.priority}
          completed={task.completed}
          onToggle={() => onToggle(task.id)}
          onDelete={() => onDelete(task.id)}
        />
      ))}
    </div>
  );
}
