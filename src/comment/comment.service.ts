import { Comment } from '@prisma/client';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { TYPES } from '../constants/constants';
import { IPagination } from '../types';
import { ICommentRepository } from './comment.repository.interface';
import { ICommentService } from './comment.service.interface';

@injectable()
class CommentService implements ICommentService {
  constructor(@inject(TYPES.ICommentRepository) private commentRepository: ICommentRepository) {}

  createComment(text: string, articleId: number, userId: number): Promise<Comment> {
    return this.commentRepository.create(text, articleId, userId);
  }

  async findPublishedCommentsByArticleId(
    limit: number,
    offset: number,
    articleId: number,
  ): Promise<IPagination<Comment>> {
    const data = await this.commentRepository.findAll(offset, limit, articleId, true);

    const count = await this.commentRepository.count(true, articleId);

    return {
      data,
      limit,
      offset,
      count,
    };
  }

  async findDraftComments(limit: number, offset: number): Promise<IPagination<Comment>> {
    const data = await this.commentRepository.findMany(offset, limit, false);

    const count = await this.commentRepository.count(false);

    return {
      data,
      limit,
      offset,
      count,
    };
  }

  publishCommentById(id: number): Promise<Comment> {
    return this.commentRepository.publish(id);
  }

  deleteCommentById(id: number): Promise<Comment> {
    return this.commentRepository.delete(id);
  }
}

export { CommentService };
