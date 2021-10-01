import type { CommentService } from '../interfaces/service.interfaces';
import { call } from './auth.service';

export const commentService: CommentService = {
  getComments: function (id: number, sortBy: string, page: number) {
    let url = `/api/railcontent/comments?content_id=${id}&limit=10&page=${page}`;
    if (sortBy === 'popular') {
      url += `&sort=-like_count`;
    } else if (sortBy === 'latest') {
      url += `&sort=-created_on`;
    } else if (sortBy === 'oldest') {
      url += `&sort=created_on`;
    } else if (sortBy === 'my_comments') {
      url += `&sort=-mine`;
    }
    return call({ url });
  },
  addComment: function (commentText: string, contentId: number) {
    return call({
      url: `/api/railcontent/comment?comment=${commentText}&content_id=${contentId}`,
      method: 'PUT'
    });
  },
  likeComment: function (id: number) {
    return call({
      url: `/api/railcontent/comment-like/${id}`,
      method: 'PUT'
    });
  },
  dislikeComment: function (id: number) {
    return call({
      url: `/api/railcontent/comment-like/${id}`,
      method: 'DELETE'
    });
  },
  addReplyToComment: function (replyText: string, commentId: number) {
    return call({
      url: `/api/railcontent/comment/reply?comment=${replyText}&parent_id=${commentId}`,
      method: 'PUT'
    });
  },
  getCommentLikes: function (commentId: number) {
    return call({
      url: `/api/railcontent/comment-likes/${commentId}`
    });
  },
  deleteComment: function (commentId: number) {
    return call({
      url: `/api/railcontent/comment/${commentId}`,
      method: 'DELETE'
    });
  }
};
