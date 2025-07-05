import React from 'react';

interface PostAuthorCardProps {
  authorName: string;
  authorAvatar: string;
  postDate: string;
}

const PostAuthorCard: React.FC<PostAuthorCardProps> = ({
  authorName,
  authorAvatar,
  postDate,
}) => {
  return (
    <div className="post-author-card">
      <img
        src={authorAvatar}
        alt={`${authorName}'s avatar`}
        className="author-avatar"
      />
      <div className="author-details">
        <h3 className="author-name">{authorName}</h3>
        <p className="post-date">{postDate}</p>
      </div>
    </div>
  );
};

export default PostAuthorCard;
