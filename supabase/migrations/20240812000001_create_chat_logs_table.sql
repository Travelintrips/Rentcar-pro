-- Create chat_logs table for storing WhatsApp messages and AI responses
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender TEXT NOT NULL,
  message_text TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_group BOOLEAN DEFAULT FALSE,
  group_name TEXT,
  push_name TEXT,
  device TEXT,
  in_response_to TEXT,
  is_ai_response BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE chat_logs;

-- Create policy to allow all operations on chat_logs
-- In a production environment, you might want to restrict this
DROP POLICY IF EXISTS "Allow all operations on chat_logs" ON chat_logs;
CREATE POLICY "Allow all operations on chat_logs"
  ON chat_logs
  FOR ALL
  USING (true);
