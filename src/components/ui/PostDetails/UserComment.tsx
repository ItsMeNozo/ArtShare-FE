import React from 'react';

interface UserCommentProps {
  username: string;
  comment: string;
  timestamp: string;
}

const UserComment: React.FC<UserCommentProps> = ({
  username,
  comment,
  timestamp,
}) => {
  return (
    <div className="user-comment">
      <div className="user-comment-header">
        <span className="username">{username}</span>
        <span className="timestamp">{timestamp}</span>
      </div>
      <div className="user-comment-body">
        <p>{comment}</p>
      </div>
    </div>
  );
};

export default UserComment;
