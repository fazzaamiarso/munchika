export interface BaseEntity {
  id: string;
  created_at: Date;
}

export interface User extends BaseEntity {
  username: string;
  avatar_url: string;
}
export interface Post extends BaseEntity {
  thought: string;
  lyrics: string;
  author_id: string;
  track_id: number;
  user: User;
}

export type PostWithUser = Post & User;