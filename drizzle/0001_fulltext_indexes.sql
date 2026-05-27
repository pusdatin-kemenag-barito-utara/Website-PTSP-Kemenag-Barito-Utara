-- Add pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN trigram indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_trgm ON profiles USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm ON profiles USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_service_requests_request_number_trgm ON service_requests USING gin (request_number gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_services_name_trgm ON services USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_trgm ON audit_logs USING gin (action gin_trgm_ops);

-- Add composite unique index for service_items slug per service
DROP INDEX IF EXISTS service_items_slug_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_items_slug_service ON service_items (service_id, slug);

-- Add unique constraint for profiles phone
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique ON profiles (phone);
