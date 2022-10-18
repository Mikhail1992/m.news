import { Comment } from '@prisma/client';
import { IsString, IsDefined, IsNumber, IsEmpty } from 'class-validator';

export class CommentCreateDto implements Omit<Comment, 'id' | 'userId'> {
  @IsDefined()
  @IsString()
  text: string;

  @IsDefined()
  @IsNumber()
  articleId: number;

  @IsEmpty()
  published: boolean;

  @IsEmpty()
  createdAt: Date;

  @IsEmpty()
  updatedAt: Date;
}
