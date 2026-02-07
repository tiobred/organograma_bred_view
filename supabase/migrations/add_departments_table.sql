-- Migration: Create departments domain table and normalize profiles.department
-- This migration creates a departments table and converts the department field
-- from free text to a foreign key relationship

-- Step 1: Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT NOT NULL, -- Hex color for org chart visualization
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Insert initial departments with colors
INSERT INTO departments (name, description, color) VALUES
('Tecnologia', 'Departamento de Tecnologia da Informação', '#6366f1'), -- Blue/Indigo
('Operações', 'Departamento de Operações', '#10b981'), -- Green/Emerald
('Recursos Humanos', 'Departamento de Recursos Humanos', '#ec4899'), -- Pink/Rose
('Diretoria', 'Diretoria Executiva', '#a855f7'), -- Purple/Violet
('Comercial', 'Departamento Comercial e Vendas', '#f97316'), -- Orange
('Financeiro', 'Departamento Financeiro', '#14b8a6'), -- Teal
('Marketing', 'Departamento de Marketing', '#8b5cf6'), -- Violet
('Atendimento', 'Departamento de Atendimento ao Cliente', '#06b6d4') -- Cyan
ON CONFLICT (name) DO NOTHING;

-- Step 3: Add new department_id column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id);

-- Step 4: Migrate existing data (match department names case-insensitively)
UPDATE profiles p
SET department_id = d.id
FROM departments d
WHERE LOWER(TRIM(p.department)) = LOWER(TRIM(d.name))
AND p.department IS NOT NULL;

-- Step 5: For any departments that don't match, create a generic "Outros" department
INSERT INTO departments (name, description, color)
VALUES ('Outros', 'Outros Departamentos', '#6b7280')
ON CONFLICT (name) DO NOTHING;

-- Update profiles with unmapped departments to "Outros"
UPDATE profiles p
SET department_id = (SELECT id FROM departments WHERE name = 'Outros')
WHERE department_id IS NULL AND department IS NOT NULL;

-- Step 6: Drop old department column (only after migration is successful)
-- IMPORTANT: Uncomment this ONLY after verifying the migration worked correctly
-- ALTER TABLE profiles DROP COLUMN IF EXISTS department;

-- Step 7: Create RLS policies for departments table
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read departments (for dropdowns)
CREATE POLICY "Allow public read on departments"
ON departments FOR SELECT
TO public
USING (true);

-- Allow insert/update/delete for authenticated users (future: restrict to admins)
CREATE POLICY "Allow public insert on departments"
ON departments FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update on departments"
ON departments FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete on departments"
ON departments FOR DELETE
TO public
USING (true);

-- Step 8: Create index for better query performance
CREATE INDEX IF NOT EXISTS profiles_department_id_idx ON profiles(department_id);

-- Step 9: Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
