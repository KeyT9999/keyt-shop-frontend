import { useState, type FormEvent } from 'react';
import { Check, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { useFocusCafeContext } from '../../../context/useFocusCafeContext';

export default function FocusTaskPopover() {
  const { tasks, addTask, toggleTask, removeTask, clearCompletedTasks } =
    useFocusCafeContext();
  const [draft, setDraft] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    addTask(draft);
    setDraft('');
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="w-[310px] sm:w-[340px] rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.65)] p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-200">
          <CheckSquare size={14} className="text-[#F05A28]" />
          <span>Mục Tiêu Ca Học ({completedCount}/{tasks.length})</span>
        </div>
        {completedCount > 0 && (
          <button
            type="button"
            onClick={clearCompletedTasks}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors duration-200 cursor-pointer"
          >
            Xóa mục xong
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="VD: Thuộc 30 từ JPD113..."
          aria-label="Nhập mục tiêu học tập"
          className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#F05A28]"
        />
        <button
          type="submit"
          aria-label="Thêm mục tiêu"
          className="w-8 h-8 rounded-xl bg-[#F05A28] hover:bg-[#df4e1d] text-white flex items-center justify-center shrink-0 transition-colors duration-200 cursor-pointer"
        >
          <Plus size={15} />
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">
          Ghi nhanh 1–3 đầu việc nhỏ để giữ sự tập trung cao nhất.
        </p>
      ) : (
        <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-white/5 border border-white/10"
            >
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-2.5 flex-1 text-left cursor-pointer"
              >
                <span
                  className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors duration-200 ${
                    task.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  {task.completed && <Check size={11} />}
                </span>
                <span
                  className={`text-xs leading-snug ${
                    task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                  }`}
                >
                  {task.text}
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeTask(task.id)}
                aria-label="Xóa mục tiêu"
                className="text-slate-400 hover:text-rose-400 p-1 transition-colors duration-200 cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
