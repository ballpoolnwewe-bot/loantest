export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      pembayaran: {
        Row: {
          catatan: string | null
          created_at: string
          direkod_oleh: string | null
          id: string
          jumlah: number
          pinjaman_id: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          direkod_oleh?: string | null
          id?: string
          jumlah: number
          pinjaman_id: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          direkod_oleh?: string | null
          id?: string
          jumlah?: number
          pinjaman_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pembayaran_pinjaman_id_fkey"
            columns: ["pinjaman_id"]
            isOneToOne: false
            referencedRelation: "pinjaman"
            referencedColumns: ["id"]
          },
        ]
      }
      permohonan: {
        Row: {
          alamat: string
          catatan_admin: string | null
          created_at: string
          emel: string
          foto_kp_path: string
          foto_selfie_path: string
          gaji_bulanan: number
          had_kredit: number | null
          id: string
          industri: string
          jumlah_dipohon: number
          nama_penuh: string
          no_kad_pengenalan: string
          no_telefon: string
          pekerjaan: string
          pengalaman_tahun: number
          status: string
          tempoh_bulan: number
          updated_at: string
          user_id: string
        }
        Insert: {
          alamat: string
          catatan_admin?: string | null
          created_at?: string
          emel: string
          foto_kp_path: string
          foto_selfie_path: string
          gaji_bulanan?: number
          had_kredit?: number | null
          id?: string
          industri: string
          jumlah_dipohon?: number
          nama_penuh: string
          no_kad_pengenalan: string
          no_telefon: string
          pekerjaan: string
          pengalaman_tahun?: number
          status?: string
          tempoh_bulan?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          alamat?: string
          catatan_admin?: string | null
          created_at?: string
          emel?: string
          foto_kp_path?: string
          foto_selfie_path?: string
          gaji_bulanan?: number
          had_kredit?: number | null
          id?: string
          industri?: string
          jumlah_dipohon?: number
          nama_penuh?: string
          no_kad_pengenalan?: string
          no_telefon?: string
          pekerjaan?: string
          pengalaman_tahun?: number
          status?: string
          tempoh_bulan?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pinjaman: {
        Row: {
          catatan_admin: string | null
          created_at: string
          id: string
          jumlah_dibayar: number
          jumlah_pokok: number
          kadar_faedah_harian: number
          nama_bank: string | null
          nama_pemegang_akaun: string | null
          no_akaun: string | null
          permohonan_id: string
          status: string
          tarikh_lulus: string | null
          tarikh_selesai: string | null
          tempoh_bulan: number | null
          tempoh_hari: number | null
          kadar_faedah_tetap: number | null
          setuju_terma_pada: string | null
          tujuan: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          catatan_admin?: string | null
          created_at?: string
          id?: string
          jumlah_dibayar?: number
          jumlah_pokok: number
          kadar_faedah_harian?: number
          nama_bank?: string | null
          nama_pemegang_akaun?: string | null
          no_akaun?: string | null
          permohonan_id: string
          status?: string
          tarikh_lulus?: string | null
          tarikh_selesai?: string | null
          tempoh_bulan?: number | null
          tempoh_hari?: number | null
          kadar_faedah_tetap?: number | null
          setuju_terma_pada?: string | null
          tujuan?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          catatan_admin?: string | null
          created_at?: string
          id?: string
          jumlah_dibayar?: number
          jumlah_pokok?: number
          kadar_faedah_harian?: number
          nama_bank?: string | null
          nama_pemegang_akaun?: string | null
          no_akaun?: string | null
          permohonan_id?: string
          status?: string
          tarikh_lulus?: string | null
          tarikh_selesai?: string | null
          tempoh_bulan?: number | null
          tempoh_hari?: number | null
          kadar_faedah_tetap?: number | null
          setuju_terma_pada?: string | null
          tujuan?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinjaman_permohonan_id_fkey"
            columns: ["permohonan_id"]
            isOneToOne: false
            referencedRelation: "permohonan"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          emel: string | null
          id: string
          nama_penuh: string | null
          no_telefon: string | null
        }
        Insert: {
          created_at?: string
          emel?: string | null
          id: string
          nama_penuh?: string | null
          no_telefon?: string | null
        }
        Update: {
          created_at?: string
          emel?: string | null
          id?: string
          nama_penuh?: string | null
          no_telefon?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      jumlah_tagihan: { Args: { _pinjaman_id: string }; Returns: number }
    }
    Enums: {
      app_role: "admin" | "pemohon"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "pemohon"],
    },
  },
} as const
