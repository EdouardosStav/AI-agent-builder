-- Add initial_input column to workflows table
ALTER TABLE public.workflows 
ADD COLUMN initial_input TEXT DEFAULT '' NOT NULL;