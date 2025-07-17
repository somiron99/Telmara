export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          website: string | null
          logo_url: string | null
          industry: string | null
          size: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          website?: string | null
          logo_url?: string | null
          industry?: string | null
          size?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          website?: string | null
          logo_url?: string | null
          industry?: string | null
          size?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          company_id: string
          author_id: string | null
          title: string
          content: string
          rating: number
          position: string | null
          department: string | null
          employment_type: string | null
          work_location: string | null
          is_anonymous: boolean
          is_current_employee: boolean
          pros: string | null
          cons: string | null
          advice_to_management: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          author_id?: string | null
          title: string
          content: string
          rating: number
          position?: string | null
          department?: string | null
          employment_type?: string | null
          work_location?: string | null
          is_anonymous?: boolean
          is_current_employee?: boolean
          pros?: string | null
          cons?: string | null
          advice_to_management?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          author_id?: string | null
          title?: string
          content?: string
          rating?: number
          position?: string | null
          department?: string | null
          employment_type?: string | null
          work_location?: string | null
          is_anonymous?: boolean
          is_current_employee?: boolean
          pros?: string | null
          cons?: string | null
          advice_to_management?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          review_id: string
          author_id: string | null
          content: string
          is_anonymous: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          review_id: string
          author_id?: string | null
          content: string
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          author_id?: string | null
          content?: string
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reactions: {
        Row: {
          id: string
          review_id: string
          user_id: string
          type: 'like' | 'helpful' | 'insightful'
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          type: 'like' | 'helpful' | 'insightful'
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          type?: 'like' | 'helpful' | 'insightful'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Company = Database['public']['Tables']['companies']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Reaction = Database['public']['Tables']['reactions']['Row']

export type ReviewWithCompany = Review & {
  companies: Company
  reactions: Reaction[]
  comments: Comment[]
}

export type CommentWithAuthor = Comment & {
  author_email?: string | null
  profiles?: {
    id: string
    username: string
    email: string
    created_at: string
    updated_at: string
  } | null
}
