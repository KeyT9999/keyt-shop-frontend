import React, { useState } from 'react';
import ReactionPicker from './ReactionPicker';

interface Reaction {
  emoji: string;
  users: string[];
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  currentUserId: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  align?: 'left' | 'right';
}

const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  align = 'left',
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleReactionClick = (emoji: string, users: string[]) => {
    const hasReacted = users.includes(currentUserId);
    
    if (hasReacted) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onAddReaction(messageId, emoji);
    setShowPicker(false);
  };

  return (
    <div className={`relative mt-1 flex max-w-full overflow-visible ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-wrap items-center gap-1">
        {reactions.map((reaction) => {
          const hasReacted = reaction.users.includes(currentUserId);
          const count = reaction.users.length;

          return (
            <button
              key={reaction.emoji}
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm leading-none transition-colors ${hasReacted ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'}`}
              onClick={() => handleReactionClick(reaction.emoji, reaction.users)}
              title={`${count} reaction${count > 1 ? 's' : ''}`}
            >
              <span className="text-base leading-none">{reaction.emoji}</span>
              <span className="text-xs font-medium leading-none">{count}</span>
            </button>
          );
        })}

        <button
          className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-sm font-semibold leading-none text-slate-700 shadow-sm transition-colors hover:border-[#F05A28] hover:bg-orange-50 hover:text-[#F05A28]"
          onClick={() => setShowPicker((isOpen) => !isOpen)}
          title="Thêm reaction"
          aria-label="Thêm reaction"
          aria-haspopup="dialog"
          aria-expanded={showPicker}
          type="button"
        >
          <span className="text-base leading-none">+</span>
        </button>
      </div>

      {showPicker && (
        <div className={`absolute bottom-full z-[80] mb-1 ${align === 'right' ? 'right-0' : 'left-0'}`}>
          <ReactionPicker
            onSelect={handleEmojiSelect}
            onClose={() => setShowPicker(false)}
          />
        </div>
      )}

    </div>
  );
};

export default MessageReactions;
