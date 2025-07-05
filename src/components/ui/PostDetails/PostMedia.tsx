import React from 'react';

interface PostMediaProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  altText?: string;
}

const PostMedia: React.FC<PostMediaProps> = ({
  mediaUrl,
  mediaType,
  altText,
}) => {
  return (
    <div className="post-media">
      {mediaType === 'image' ? (
        <img
          src={mediaUrl}
          alt={altText || 'Post media'}
          className="post-media__image"
        />
      ) : (
        <video controls className="post-media__video">
          <source src={mediaUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default PostMedia;
