import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xroedmquztpnblwxukah.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyb2VkbXF1enRwbmJsd3h1a2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjM0NzUsImV4cCI6MjA5Nzg5OTQ3NX0.pD_hMB2db8-9DpCMzW6wx5ALPNm8ZQjVyJG3Q9rTPus';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
