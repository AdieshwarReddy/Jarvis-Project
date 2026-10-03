-- ============================================================
-- ADHII JARVIS - SEED DATA
-- Project Identifier: adhii_jarvis
-- Sample initial data template for testing and demonstration
-- ============================================================

-- Note: Replace '00000000-0000-0000-0000-000000000000' with actual user_id when running manually.

DO $$
DECLARE
    demo_user_id UUID := '00000000-0000-0000-0000-000000000000';
    demo_conv_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Check if auth user exists before inserting seed data
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = demo_user_id) THEN

        -- Seed Profile
        INSERT INTO public.profiles (id, email, display_name, preferred_name, timezone, preferred_language)
        VALUES (demo_user_id, 'demo@adhiijarvis.ai', 'Adhi User', 'Adhi', 'Asia/Kolkata', 'en')
        ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

        -- Seed Long-Term Memory
        INSERT INTO public.memories (id, user_id, memory_type, content, importance)
        VALUES 
            (uuid_generate_v4(), demo_user_id, 'preference', 'Prefers concise, actionable responses with code examples in Python and TypeScript.', 5),
            (uuid_generate_v4(), demo_user_id, 'fact', 'Working on placement portfolio projects and technical interview preparation.', 4),
            (uuid_generate_v4(), demo_user_id, 'instruction', 'Always confirm before deleting tasks, notes, or scheduling reminders.', 5)
        ON CONFLICT DO NOTHING;

        -- Seed Initial Conversation
        INSERT INTO public.conversations (id, user_id, title, summary)
        VALUES (demo_conv_id, demo_user_id, 'Welcome to Adhii Jarvis', 'Introduction to Adhii Jarvis capabilities, tools, and voice assistant features.')
        ON CONFLICT (id) DO NOTHING;

        -- Seed Messages
        INSERT INTO public.messages (conversation_id, user_id, role, content, message_type)
        VALUES 
            (demo_conv_id, demo_user_id, 'user', 'Hello Jarvis, what can you do for me?', 'text'),
            (demo_conv_id, demo_user_id, 'assistant', 'Greetings Adhi. I am your personal AI Workspace. I can assist with voice conversations, document intelligence and Q&A, managing your tasks and notes, scheduling reminders, calculations, and live searches. How may I assist you today?', 'text')
        ON CONFLICT DO NOTHING;

        -- Seed Tasks
        INSERT INTO public.tasks (user_id, title, description, status, priority, due_at)
        VALUES 
            (demo_user_id, 'Practice Data Structures & Algorithms', 'Solve 3 medium LeetCode problems on Dynamic Programming', 'pending', 'high', now() + INTERVAL '1 day'),
            (demo_user_id, 'Review Adhii Jarvis Architecture', 'Study the Mermaid diagrams and placement interview guide in docs/', 'completed', 'medium', now() - INTERVAL '1 day'),
            (demo_user_id, 'Prepare Voice AI Demo', 'Test the push-to-talk voice pipeline with Edge-TTS', 'pending', 'urgent', now() + INTERVAL '2 days');

        -- Seed Notes
        INSERT INTO public.notes (user_id, title, content)
        VALUES 
            (demo_user_id, 'Placement Preparation Key Points', '1. Explain modular LLM provider pattern\n2. Highlight safe tool confirmation architecture\n3. Describe RAG vector retrieval pipeline\n4. Emphasize user data isolation with Supabase RLS'),
            (demo_user_id, 'FastAPI + Socket.IO Architecture', 'FastAPI serves both REST endpoints and the python-socketio ASGI application seamlessly with event-driven streaming token delivery.');

        -- Seed Reminder
        INSERT INTO public.reminders (user_id, title, reminder_at, status)
        VALUES 
            (demo_user_id, 'Review System Architecture with Mentor', now() + INTERVAL '4 hours', 'pending');

    END IF;
END $$;
