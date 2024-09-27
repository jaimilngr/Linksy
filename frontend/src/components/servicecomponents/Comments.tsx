import { useState } from "react";
import Avatar from "../Uicomponents/Avatar";

interface CommentProps {
  id: string;
  content: string;
  user: {
    name: string | null; // Allow null for user name
  } | null; // Allow user to be null
  provider: {
    name: string | null; // Allow null for provider name
  };
  parentId: string | null;
  replies: CommentProps[];
}

interface CommentComponentProps {
  comment: CommentProps;
  onReply: (commentId: string, content: string) => void;
}

export function Comment({ comment, onReply }: CommentComponentProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReplySubmit = () => {
    if (replyContent.trim() === "") return;
    onReply(comment.id, replyContent);
    setReplyContent("");
    setShowReplyForm(false);
  };

  const handleReplyClick = () => {
    setShowReplyForm((prev) => !prev);
    setShowReplies(false); 
  };

  // Determine display name
  const displayName = comment.user?.name || comment.provider.name || "Anonymous";

  return (
    <div className="mb-4 p-4 border border-gray-300 rounded-lg">
      <div className="flex items-start">
        <Avatar />
        <div className="flex-1 ml-5">
          <strong className="block text-lg font-semibold">
            {displayName}
          </strong>
          <p className="mt-1 text-text">{comment.content}</p>
          <div className="mt-2">
            {comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies((prev) => !prev)}
                className="text-blue-500 hover:underline mr-5"
              >
                {showReplies ? "Hide Replies" : "Show Replies"}
              </button>
            )}
            <button
              onClick={handleReplyClick}
              className="text-blue-500 hover:underline"
            >
              Reply
            </button>
            {showReplies && (
              <div className="ml-4 mt-2">
                {comment.replies.map((reply) => (
                  <Comment key={reply.id} comment={reply} onReply={onReply} />
                ))}
              </div>
            )}
          </div>
          {showReplyForm && (
            <div className="mt-2">
              <textarea
                className="block p-2 w-full border text-black border-gray-300 rounded"
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <button
                onClick={handleReplySubmit}
                className="mt-2 text-white bg-blue-700 hover:bg-blue-800 rounded px-4 py-2"
              >
                Post Reply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
