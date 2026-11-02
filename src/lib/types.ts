export type UserRole = "admin" | "customer";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface Category {
  id: number;
  name: string;
}

export interface Author {
  id: number;
  name: string;
}

/** A row of the public.book_catalog view (non-deleted books only). */
export interface CatalogBook {
  id: number;
  title: string;
  price: number;
  stock: number;
  description: string;
  cover_path: string | null;
  thumbnail_path: string | null;
  created_at: string;
  author_id: number;
  author_name: string;
  category_id: number;
  category_name: string;
}

/** Shape returned by Server Actions to client forms. */
export interface FormState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
}
