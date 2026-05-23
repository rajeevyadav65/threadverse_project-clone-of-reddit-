-- ─────────────────────────────────────────────────────────────
--  ThreadVerse — Seed Data (run after first backend startup)
--  The backend auto-creates tables via spring.jpa.hibernate.ddl-auto=update
--  Run this script to populate sample data.
-- ─────────────────────────────────────────────────────────────

-- Sample users (passwords are bcrypt of "password123")
INSERT INTO users (username, email, password, post_karma, comment_karma, role, enabled, created_at, updated_at)
VALUES
  ('admin',         'admin@threadverse.com',         '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 15000, 3200, 'ADMIN',     true, NOW(), NOW()),
  ('techguru',      'techguru@example.com',           '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 8400,  1200, 'USER',      true, NOW(), NOW()),
  ('sciencenerd',   'sciencenerd@example.com',        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 22100, 4500, 'USER',      true, NOW(), NOW()),
  ('devmaster99',   'devmaster@example.com',          '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 5600,  890,  'USER',      true, NOW(), NOW()),
  ('founder_vibes', 'founder@example.com',            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 31000, 7200, 'MODERATOR', true, NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- Sample communities
INSERT INTO communities (name, description, icon, theme_color, member_count, is_nsfw, is_private, created_at)
VALUES
  ('technology',  'The intersection of technology, innovation and culture.',       '💻', '#5865F2', 14200000, false, false, NOW()),
  ('science',     'Science, research, and fascinating discoveries from the world.','🔬', '#2D9CDB', 28500000, false, false, NOW()),
  ('programming', 'Computer programming discussions for all skill levels.',         '⌨️', '#27AE60', 5800000,  false, false, NOW()),
  ('worldnews',   'Major news from around the world, sourced reputable outlets.',   '🌍', '#E74C3C', 31200000, false, false, NOW()),
  ('gaming',      'A subreddit for gamers of all types and platforms.',             '🎮', '#9B59B6', 36700000, false, false, NOW()),
  ('design',      'Design for all disciplines — UI/UX, graphic, brand and more.',  '🎨', '#F39C12', 3100000,  false, false, NOW()),
  ('startups',    'Community for startup founders, investors, and enthusiasts.',    '🚀', '#1ABC9C', 1200000,  false, false, NOW())
ON CONFLICT (name) DO NOTHING;

-- Community rules
INSERT INTO community_rules (community_id, rule)
SELECT id, 'Be respectful and civil to all members'       FROM communities WHERE name = 'technology'  ON CONFLICT DO NOTHING;
INSERT INTO community_rules (community_id, rule)
SELECT id, 'No spam or self-promotion without disclosure' FROM communities WHERE name = 'technology'  ON CONFLICT DO NOTHING;
INSERT INTO community_rules (community_id, rule)
SELECT id, 'Peer-reviewed sources required for claims'    FROM communities WHERE name = 'science'     ON CONFLICT DO NOTHING;
INSERT INTO community_rules (community_id, rule)
SELECT id, 'No pseudoscience or misinformation'           FROM communities WHERE name = 'science'     ON CONFLICT DO NOTHING;

-- Community flairs
INSERT INTO community_flairs (community_id, flair)
SELECT id, unnest(ARRAY['Discussion','News','Question','Tutorial','Project']) FROM communities WHERE name = 'technology' ON CONFLICT DO NOTHING;
INSERT INTO community_flairs (community_id, flair)
SELECT id, unnest(ARRAY['Biology','Physics','Chemistry','Space','Climate'])   FROM communities WHERE name = 'science'    ON CONFLICT DO NOTHING;
INSERT INTO community_flairs (community_id, flair)
SELECT id, unnest(ARRAY['Question','Project','Article','Tutorial'])           FROM communities WHERE name = 'programming' ON CONFLICT DO NOTHING;

-- Sample posts
INSERT INTO posts (title, content, type, flair, author_id, community_id, vote_count, comment_count, view_count, is_pinned, created_at, updated_at)
VALUES (
  'The Future of Quantum Computing: What 2025 Means for Encryption',
  'Recent breakthroughs in quantum computing have sent shockwaves through the cryptography community. IBM and Google have both announced major milestones that could make current RSA encryption obsolete within a decade. Researchers are scrambling to develop post-quantum cryptography standards, with NIST recently finalizing CRYSTALS-Kyber and CRYSTALS-Dilithium as the first post-quantum standards.',
  'TEXT', 'Discussion',
  (SELECT id FROM users WHERE username = 'techguru'),
  (SELECT id FROM communities WHERE name = 'technology'),
  45821, 1243, 234500, false, NOW() - INTERVAL '4 hours', NOW()
),
(
  'Scientists Discover New Deep-Sea Creature That Produces Its Own Light Source',
  'A research team from MBARI has identified a new bioluminescent species at a depth of 3,200 meters in the Pacific Ocean. The organism uses a previously unknown chemical pathway to produce light, which could have implications for medical imaging technology.',
  'IMAGE', 'Biology',
  (SELECT id FROM users WHERE username = 'sciencenerd'),
  (SELECT id FROM communities WHERE name = 'science'),
  89230, 2108, 891000, false, NOW() - INTERVAL '7 hours', NOW()
),
(
  'We reached $1M ARR in 14 months with zero marketing budget — AMA!',
  'Exactly 14 months ago we launched our B2B SaaS tool with no budget. Just two founders and a product. Today we crossed $1M ARR. I will be here for the next 3 hours answering everything: how we found first customers, pricing strategy, technical stack, and every mistake we made along the way.',
  'TEXT', 'Story',
  (SELECT id FROM users WHERE username = 'founder_vibes'),
  (SELECT id FROM communities WHERE name = 'startups'),
  54200, 1892, 412000, true, NOW() - INTERVAL '6 hours', NOW()
)
ON CONFLICT DO NOTHING;

COMMIT;
