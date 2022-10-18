import { Comment } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { TYPES } from '../constants/constants';
import { DatabaseService } from '../database/database.service';
import { ICommentRepository } from './comment.repository.interface';

@injectable()
class CommentRepository implements ICommentRepository {
  constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {}

  async create(text: string, articleId: number, userId: number): Promise<Comment> {
    return await this.databaseService.client.comment.create({ data: { text, articleId, userId } });
  }

  async findAll(
    offset: number,
    limit: number,
    articleId: number,
    published: boolean,
  ): Promise<Comment[]> {
    const query = { where: { articleId, published } };

    return await this.databaseService.client.comment.findMany({
      ...query,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findMany(offset: number, limit: number, published: boolean): Promise<Comment[]> {
    const query = { where: { published } };

    return await this.databaseService.client.comment.findMany({
      ...query,
      include: {
        article: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async count(published: boolean, articleId?: number): Promise<number> {
    const query = { where: { articleId, published } };

    return await this.databaseService.client.comment.count(query);
  }

  async publish(id: number): Promise<Comment> {
    return await this.databaseService.client.comment.update({
      where: { id },
      data: { published: true },
    });
  }

  async delete(id: number): Promise<Comment> {
    return await this.databaseService.client.comment.delete({ where: { id } });
  }
}

export { CommentRepository };
