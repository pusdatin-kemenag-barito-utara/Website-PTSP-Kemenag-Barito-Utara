# Entity Relationship Diagram (ERD): PTSP Kemenag Barito Utara

Berikut adalah visualisasi struktur database modular yang kita gunakan.

```mermaid
erDiagram
    USERS ||--|| PROFILES : "has"
    PROFILES ||--o{ SERVICE_REQUESTS : "submits"
    PROFILES ||--o{ AUDIT_LOGS : "performs"
    PROFILES ||--o{ ACTIVITY_LOGS : "records_action"
    
    SERVICES ||--o{ SERVICE_ITEMS : "contains"
    SERVICE_ITEMS ||--o{ SERVICE_REQUIREMENTS : "defines"
    SERVICE_ITEMS ||--o{ SERVICE_FORM_FIELDS : "defines"
    SERVICE_ITEMS ||--o{ SERVICE_REQUESTS : "ordered_in"
    
    SERVICE_REQUESTS ||--o{ ACTIVITY_LOGS : "has_history"
    
    SYSTEM_STATUS {
        string id PK "heartbeat"
        timestamp last_ping
        string notes
    }

    PROFILES {
        uuid id PK
        string full_name
        string email
        string role "admin/user"
        jsonb permissions
    }

    SERVICES {
        bigint id PK
        string name
        string slug
        boolean is_active
    }

    SERVICE_ITEMS {
        bigint id PK
        bigint service_id FK
        string name
        string slug
    }

    SERVICE_REQUESTS {
        uuid id PK
        bigint service_item_id FK
        uuid user_id FK
        string status "pending/approved/rejected"
        jsonb form_data
        jsonb documents
        string ticket_number
    }

    AUDIT_LOGS {
        bigserial id PK
        uuid admin_id FK
        string action
        jsonb details
    }
```

## Deskripsi Relasi:
1. **Users & Profiles**: Relasi 1:1 antara tabel sistem auth Supabase dengan profil pengguna aplikasi.
2. **Services & Items**: Satu kategori layanan (Services) bisa memiliki banyak jenis layanan (Service Items).
3. **Requests**: Jantung dari aplikasi, menghubungkan User dengan Service Item yang dipilih serta menyimpan data form dan dokumen.
4. **Logs**: `Audit Logs` memantau aktivitas admin, sedangkan `Activity Logs` memantau riwayat perjalanan sebuah pengajuan (tracking).
5. **System Status**: Digunakan untuk aktivitas heartbeat agar database tidak dipause.
