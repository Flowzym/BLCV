-- Create ki_settings table for configurable KI models

CREATE TABLE IF NOT EXISTS public.ki_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text NOT NULL,
  endpoint text NOT NULL,
  api_key text,
  temperature numeric DEFAULT 0.7,
  top_p numeric DEFAULT 1.0,
  max_tokens integer DEFAULT 2048,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT current_timestamp
);
