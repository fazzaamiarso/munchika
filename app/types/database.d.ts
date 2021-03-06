export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
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
  fts: string; //full text search field (type tsvector)
  user: User;
}
