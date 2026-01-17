'use client';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function ChatInput({ value, onChange, onSubmit }: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your math problem..."
          className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          autoFocus
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Start Working
        </button>
      </div>
    </form>
  );
}
