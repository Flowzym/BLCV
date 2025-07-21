/*
  # Add active column to ki_settings table

  1. Changes
    - Add `active` column to `ki_settings` table as boolean with default false
    - This aligns the database schema with the application's KIModelSettings interface

  2. Notes
    - The table already has an `is_active` column, but the application expects `active`
    - Adding the new column to match the TypeScript interface expectations
*/

-- Add the active column to ki_settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ki_settings' AND column_name = 'active'
  ) THEN
    ALTER TABLE ki_settings ADD COLUMN active boolean DEFAULT false;
  END IF;
END $$;