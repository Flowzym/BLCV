/*
  # Create field_mappings table

  1. New Tables
    - `field_mappings`
      - `id` (uuid, primary key)
      - `table_name` (text, not null) - Name of the source table
      - `field_name` (text, not null) - Name of the field/column in the source table
      - `app_field` (text, not null) - Corresponding field name in the application
      - `is_active` (boolean, default true) - Whether this mapping is active
      - `created_at` (timestamp with time zone, default now())
      - `updated_at` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on `field_mappings` table
    - Add policies for authenticated users to manage field mappings
    - Add policy for public users to read field mappings

  3. Indexes
    - Index on table_name for faster lookups
    - Index on field_name for faster searches
    - Composite index on table_name and field_name for mapping queries
*/

CREATE TABLE IF NOT EXISTS field_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  field_name text NOT NULL,
  app_field text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE field_mappings ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_field_mappings_table_name ON field_mappings(table_name);
CREATE INDEX IF NOT EXISTS idx_field_mappings_field_name ON field_mappings(field_name);
CREATE INDEX IF NOT EXISTS idx_field_mappings_table_field ON field_mappings(table_name, field_name);

-- RLS Policies
CREATE POLICY "Public can read field mappings"
  ON field_mappings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert field mappings"
  ON field_mappings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update field mappings"
  ON field_mappings
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete field mappings"
  ON field_mappings
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger function for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for field_mappings table
CREATE TRIGGER update_field_mappings_updated_at
  BEFORE UPDATE ON field_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();