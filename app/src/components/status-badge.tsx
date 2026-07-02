const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  todo: { label: "To Do", color: "#6a6e73", bg: "rgba(106,110,115,0.15)" },
  in_progress: { label: "In Progress", color: "#06c", bg: "rgba(0,102,204,0.15)" },
  done: { label: "Done", color: "#3e8635", bg: "rgba(62,134,53,0.15)" },
  blocked: { label: "Blocked", color: "#f0ab00", bg: "rgba(240,171,0,0.15)" },
  error: { label: "Error", color: "#c9190b", bg: "rgba(201,25,11,0.15)" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.todo;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
