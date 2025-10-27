-- Adicionar campos do Supabase à tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS supabase_id UUID UNIQUE,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS api_token TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS birth_date TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt-br';

-- Renomear coluna existente para manter compatibilidade
ALTER TABLE users RENAME COLUMN profile_image TO profile_image_old;
ALTER TABLE users ADD COLUMN profile_image TEXT;
UPDATE users SET profile_image = profile_image_old WHERE profile_image_old IS NOT NULL;
ALTER TABLE users DROP COLUMN profile_image_old;