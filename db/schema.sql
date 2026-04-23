CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT UNIQUE,
  whatsapp_phone TEXT UNIQUE,
  exam_type TEXT NOT NULL,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  exam_date DATE,
  study_hours_per_day INTEGER DEFAULT 2,
  streak_count INTEGER DEFAULT 0,
  last_active_date DATE,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive',
  daily_questions_used INTEGER DEFAULT 0,
  daily_tutor_messages_used INTEGER DEFAULT 0,
  daily_reset_date DATE DEFAULT CURRENT_DATE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_source TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE whatsapp_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  profile_id UUID REFERENCES profiles(id),
  display_name TEXT,
  exam_type TEXT,
  subjects TEXT[] DEFAULT '{}',
  exam_date DATE,
  subscription_tier TEXT DEFAULT 'free',
  daily_questions_used INTEGER DEFAULT 0,
  daily_tutor_messages_used INTEGER DEFAULT 0,
  daily_reset_date DATE DEFAULT CURRENT_DATE,
  streak_count INTEGER DEFAULT 0,
  last_active_date DATE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT,
  topics JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type TEXT NOT NULL,
  subject_id UUID REFERENCES subjects(id),
  topic TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  metadata JSONB,
  times_served INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE practice_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  whatsapp_user_id UUID REFERENCES whatsapp_users(id),
  question_id UUID REFERENCES questions(id),
  session_id UUID,
  platform TEXT NOT NULL DEFAULT 'web',
  selected_answer TEXT,
  is_correct BOOLEAN,
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (user_id IS NOT NULL OR whatsapp_user_id IS NOT NULL)
);

CREATE TABLE mock_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  exam_type TEXT NOT NULL,
  subjects TEXT[] NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  score_percentage NUMERIC(5, 2),
  time_allowed_seconds INTEGER NOT NULL,
  time_used_seconds INTEGER,
  status TEXT DEFAULT 'in_progress',
  question_ids UUID[] NOT NULL,
  answers JSONB,
  ai_report TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE tutor_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  whatsapp_user_id UUID REFERENCES whatsapp_users(id),
  platform TEXT NOT NULL DEFAULT 'web',
  subject TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (user_id IS NOT NULL OR whatsapp_user_id IS NOT NULL)
);

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  whatsapp_user_id UUID REFERENCES whatsapp_users(id),
  question_id UUID REFERENCES questions(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (user_id IS NOT NULL OR whatsapp_user_id IS NOT NULL)
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  whatsapp_user_id UUID REFERENCES whatsapp_users(id),
  paystack_subscription_code TEXT,
  paystack_customer_code TEXT,
  paystack_reference TEXT,
  plan TEXT NOT NULL,
  tier TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  payment_source TEXT DEFAULT 'web',
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (user_id IS NOT NULL OR whatsapp_user_id IS NOT NULL)
);

CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  whatsapp_user_id UUID REFERENCES whatsapp_users(id),
  plan_data JSONB NOT NULL,
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (user_id IS NOT NULL OR whatsapp_user_id IS NOT NULL)
);

CREATE TABLE group_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  question_count INTEGER NOT NULL,
  current_question INTEGER DEFAULT 0,
  question_ids UUID[] NOT NULL,
  participants JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id),
  referrer_whatsapp_id UUID REFERENCES whatsapp_users(id),
  referred_id UUID REFERENCES profiles(id),
  referred_whatsapp_id UUID REFERENCES whatsapp_users(id),
  reward_granted BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'web',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_exam_subject ON questions(exam_type, subject_id);
CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_practice_user ON practice_attempts(user_id);
CREATE INDEX idx_practice_wa_user ON practice_attempts(whatsapp_user_id);
CREATE INDEX idx_practice_session ON practice_attempts(session_id);
CREATE INDEX idx_mock_user ON mock_exams(user_id);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_whatsapp_users_phone ON whatsapp_users(phone);
CREATE INDEX idx_group_sessions_group ON group_sessions(group_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users read own attempts" ON practice_attempts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own attempts" ON practice_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own mocks" ON mock_exams
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own chats" ON tutor_chats
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own plans" ON study_plans
  FOR SELECT USING (auth.uid() = user_id);

