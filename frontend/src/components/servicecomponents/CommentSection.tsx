import { useState, useEffect } from 'react';
import axios from 'axios';
import { Comment } from './Comments'; 
import { PopUp } from '../Uicomponents/Popup'; 
import { BACKEND_URL } from '../../config';
import Cookies from "js-cookie";

interface CommentProps {
  id: string;
  content: string;
  user: {
    name: string | null;
  };
  provider: {
    name: string | null;
  };
  parentId: string | null;
  replies: CommentProps[];
}

interface CommentsSectionProps {
  serviceId: string;
}

export function CommentsSection({ serviceId }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    fetchComments();
  }, [serviceId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/comment/bulk/${serviceId}`, {
        headers: {
          Authorization: Cookies.get("token") || "",
        },
      });
      const fetchedComments = response.data.comments;
      const structuredComments = structureComments(fetchedComments);
      setComments(structuredComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setPopupMessage("Error fetching comments. Please try again later.");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const structureComments = (comments: CommentProps[]) => {
    const commentMap: { [key: string]: CommentProps } = {};
    const topLevelComments: CommentProps[] = [];

    comments.forEach(comment => {
      comment.replies = [];
      commentMap[comment.id] = comment;
      if (comment.parentId === null) {
        topLevelComments.push(comment);
      } else if (commentMap[comment.parentId]) {
        commentMap[comment.parentId].replies.push(comment);
      }
    });

    return topLevelComments;
  };

  const handleReply = async (commentId: string, replyContent: string) => {
    const token = Cookies.get("token");
    if (!token) {
      setPopupMessage('You must be logged in to post a reply.');
      setShowPopup(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/comment/:serviceId`, {
        content: replyContent,
        serviceId,
        parentId: commentId
      },{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        fetchComments();
      } else {
        console.error("Error posting reply");
        setPopupMessage("Error posting reply. Please try again.");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      setPopupMessage("Error posting reply. Please try again.");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    const token = Cookies.get("token");
    if (!token) {
      setPopupMessage('You must be logged in to post a comment.');
      setShowPopup(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/comment/${serviceId}`, {
        content,
        serviceId: serviceId,
      },{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200 || response.status === 201) {
        fetchComments();
        setContent("");
      } else {
        console.error("Unexpected response status:", response.status);
        setPopupMessage("Error posting comment. Please try again.");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      setPopupMessage("Error posting comment. Please try again.");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 border-b border-slate-200 pb-4 w-screen max-w-screen-md cursor-pointer">
        <div className="flex">
          <div className="h-4 w-4 bg-gray-200 rounded-full w-48 mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative bg-background p-6 rounded shadow w-full max-w-sm md:max-w-md">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 pt-1"
              onClick={() => setShowPopup(false)}
            >
              ❌
            </button>
            <PopUp issue={popupMessage} bar={false} />
          </div>
        </div>
      )}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your review</label>
        <textarea
          id="content"
          rows={4}
          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Write your thoughts here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-5 mt-2"
          onClick={handlePostComment}
        >
          Post review
        </button>
      </div>
      {comments.length > 0 ? (
        comments.map(comment => (
          <Comment key={comment.id} comment={comment} onReply={handleReply} />
        ))
      ) : (
        <p>No reviews yet. Be the first to share your thoughts!</p>
      )}
    </div>
  );
}