-- ====================================================================
-- MockLife Platform — PostgreSQL Schema for AWS RDS & Production
-- ====================================================================

-- 1. Users table (Hisoblar va Shaxsiy ma'lumotlar)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    phone VARCHAR(32) UNIQUE,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(32) DEFAULT 'student',
    
    -- Diagnostic & Academic Profile
    target_band NUMERIC(3, 1) DEFAULT 7.0,
    current_level VARCHAR(64) DEFAULT 'B1',
    current_band NUMERIC(3, 1) DEFAULT 5.5,
    exam_type VARCHAR(32) DEFAULT 'ACADEMIC', -- 'ACADEMIC' or 'GENERAL'
    study_reason VARCHAR(255) DEFAULT 'BACHELOR',
    target_exam_date VARCHAR(64),
    daily_study_minutes INT DEFAULT 30,
    weak_skills TEXT[] DEFAULT ARRAY['writing', 'speaking'],
    
    -- Subscription & Access
    is_subscribed BOOLEAN DEFAULT true,
    subscription_plan VARCHAR(64) DEFAULT 'TRIAL_7_DAYS',
    subscription_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    
    -- Gamification & Stats
    study_streak_days INT DEFAULT 1,
    tests_completed INT DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Onboarding Submissions (ielts.gg uslubidagi 14 ta diagnostik savol javoblari)
CREATE TABLE IF NOT EXISTS onboarding_submissions (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(128) UNIQUE NOT NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Foydalanuvchi ma'lumotlari (ro'yxatdan o'tishdan oldin kiritilgan)
    email VARCHAR(255),
    phone VARCHAR(32),
    full_name VARCHAR(255),
    
    -- 14 ta diagnostik savol javoblari JSONB formatda
    answers JSONB NOT NULL,
    
    -- AI hisoblagan diagnostik natijalar (Overall, Listening, Reading, Writing, Speaking)
    diagnostic_scores JSONB NOT NULL,
    
    -- Gamifikatsiya (Spin the Wheel chegirmasi)
    discount_percentage INT DEFAULT 0,
    discount_code VARCHAR(64),
    
    -- Holat
    status VARCHAR(32) DEFAULT 'completed', -- 'quiz_done', 'registered', 'subscribed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Study Plans (Moslashtirilgan O'quv Rejalari)
CREATE TABLE IF NOT EXISTS study_plans (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_band NUMERIC(3, 1) NOT NULL,
    current_band NUMERIC(3, 1) NOT NULL,
    exam_type VARCHAR(32) DEFAULT 'ACADEMIC',
    duration_weeks INT DEFAULT 4,
    current_week INT DEFAULT 1,
    
    -- Kunlik vazifalar (Listening, Reading, Writing, Speaking)
    daily_tasks JSONB NOT NULL,
    
    -- 4 haftalik jadval
    weekly_schedule JSONB NOT NULL,
    
    progress_percentage INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Subscriptions & Payments (Obunalar va To'lovlar)
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(64) NOT NULL, -- 'MONTHLY_165K', 'QUARTERLY_330K', 'ANNUAL_630K'
    plan_name VARCHAR(255) NOT NULL,
    amount_uzs INT NOT NULL,
    currency VARCHAR(10) DEFAULT 'UZS',
    payment_provider VARCHAR(32) NOT NULL, -- 'Click', 'Payme', 'Uzum', 'Stripe', 'Card'
    payment_status VARCHAR(32) DEFAULT 'active', -- 'active', 'pending', 'cancelled', 'expired'
    discount_applied INT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Exam Test Attempts (Sinov test natijalari)
CREATE TABLE IF NOT EXISTS test_attempts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    section VARCHAR(32) NOT NULL, -- 'LISTENING', 'READING', 'WRITING', 'SPEAKING', 'FULL_MOCK'
    test_title VARCHAR(255) NOT NULL,
    score_raw INT,
    score_band NUMERIC(3, 1) NOT NULL,
    time_spent_seconds INT DEFAULT 0,
    feedback_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_onboarding_session ON onboarding_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_user ON onboarding_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_user ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON test_attempts(user_id);
