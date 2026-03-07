-- ============================================================
-- Test Insert Queries
-- Replace <author_id> with a real profile UUID from your profiles table
-- You can find it with: SELECT id, username FROM profiles;
-- ============================================================

-- ───────────────────────────────────────────────────────────
-- 1. Insert a note WITHOUT video (PDF / file note)
-- ───────────────────────────────────────────────────────────
INSERT INTO public.notes (title, description, author_id, subject, grade, unit, note_type, tags, file_url, youtube_url)
VALUES (
  'Türev Konu Anlatımı',
  'Türev tanımı, türev alma kuralları ve uygulama örnekleri.',
  '<author_id>',      -- replace with UUID
  'matematik',
  12,
  'Türev',
  'note',
  ARRAY['türev', 'limit', 'matematik'],
  'https://example.com/path-to-your-pdf.pdf',  -- replace with real Storage URL or NULL
  NULL
);

-- ───────────────────────────────────────────────────────────
-- 2. Insert a note WITH YouTube video
-- ───────────────────────────────────────────────────────────
INSERT INTO public.notes (title, description, author_id, subject, grade, unit, note_type, tags, file_url, youtube_url)
VALUES (
  'Fizik - Kuvvet ve Hareket Video Ders',
  'Newton hareket yasaları ve problem çözümleri video anlatım.',
  '<author_id>',      -- replace with UUID
  'fizik',
  10,
  'Kuvvet ve Hareket',
  'video',
  ARRAY['fizik', 'newton', 'kuvvet'],
  NULL,
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'  -- replace with real YT link
);

-- ───────────────────────────────────────────────────────────
-- 3. Insert a note WITH BOTH video and PDF
-- ───────────────────────────────────────────────────────────
INSERT INTO public.notes (title, description, author_id, subject, grade, unit, note_type, tags, file_url, youtube_url)
VALUES (
  'Kimya - Organik Bileşikler',
  'Organik kimya giriş ve alkanlar konu anlatımı + PDF.',
  '<author_id>',      -- replace with UUID
  'kimya',
  11,
  'Organik Kimya',
  'video',
  ARRAY['kimya', 'organik', 'alkan'],
  'https://example.com/kimya-organik.pdf',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
);

-- ───────────────────────────────────────────────────────────
-- 4. Insert a question
-- ───────────────────────────────────────────────────────────
INSERT INTO public.questions (title, body, author_id, subject, grade, unit, tags)
VALUES (
  'Türevde L''Hôpital kuralı ne zaman kullanılır?',
  'Limit sorularında 0/0 veya ∞/∞ belirsizliği olduğunda L''Hôpital kullanılır deniyor ama tam olarak hangi durumlarda uygulanacağını anlamadım. Örnekle açıklayabilir misiniz?',
  '<author_id>',      -- replace with UUID
  'matematik',
  12,
  'Türev',
  ARRAY['türev', 'limit', 'lhopital']
);

-- ───────────────────────────────────────────────────────────
-- 5. Insert a question with YouTube video
-- ───────────────────────────────────────────────────────────
INSERT INTO public.questions (title, body, author_id, subject, grade, unit, tags, youtube_url)
VALUES (
  'Bu fizik sorusunu çözemiyorum',
  'Eğik düzlem üzerinde sürtünmeli hareket sorusu. Çözüm yolunu anlatabilir misiniz?',
  '<author_id>',      -- replace with UUID
  'fizik',
  10,
  'Kuvvet ve Hareket',
  ARRAY['fizik', 'eğik düzlem', 'sürtünme'],
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
);

-- ───────────────────────────────────────────────────────────
-- 6. Set user roles for testing
-- ───────────────────────────────────────────────────────────
-- Make yourself admin:
-- UPDATE profiles SET role = 'admin' WHERE username = 'umutarda33';

-- Make a user a teacher with a branch:
-- UPDATE profiles SET role = 'teacher', subject = 'matematik' WHERE username = 'some_teacher_username';

-- Check all profiles:
-- SELECT id, username, role, subject FROM profiles;
