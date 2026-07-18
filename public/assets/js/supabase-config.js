/* ==========================================================
   Configuration Supabase
   La clé "anon" est publique par conception (elle est faite pour
   être exposée côté client) : la vraie sécurité vient des règles
   RLS définies sur la table dans le dashboard Supabase.
   ========================================================== */

const SUPABASE_URL = 'https://wxgydmedenrrxnuqyxjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4Z3lkbWVkZW5ycnhudXF5eGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxOTg1MDcsImV4cCI6MjA5OTc3NDUwN30.2jL_FCeR-K8UMOjvFiUJltQRu6RRjZrRIzIhtLhPeLU';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
