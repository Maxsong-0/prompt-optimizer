-- =====================================================
-- Promto 数据库初始化迁移
-- 版本: 001
-- 日期: 2025-12-03
-- 说明: 创建核心表结构和RLS策略
-- =====================================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 为V2预留：向量搜索
-- CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- 枚举类型定义
-- =====================================================

-- 用户角色
CREATE TYPE user_role AS ENUM ('user', 'pro', 'admin');

-- 订阅等级
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');

-- 优化模式
CREATE TYPE optimization_mode AS ENUM ('quick', 'deep');

-- 任务状态
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- AI模型提供商
CREATE TYPE ai_provider AS ENUM ('openai', 'anthropic');

-- =====================================================
-- 1. profiles 表 - 用户扩展信息
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    subscription_tier subscription_tier DEFAULT 'free' NOT NULL,
    credits INTEGER DEFAULT 100 NOT NULL,
    preferences JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS策略
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 自动创建profile的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. prompts 表 - 提示词存储
-- =====================================================
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    original_content TEXT NOT NULL,
    optimized_content TEXT,
    model_used ai_provider,
    optimization_mode optimization_mode,
    score DECIMAL(3, 2) CHECK (score >= 0 AND score <= 5),
    metadata JSONB DEFAULT '{}' NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,
    parent_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL,
    -- V2预留：向量嵌入字段
    -- embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_is_public ON public.prompts(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON public.prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_metadata ON public.prompts USING GIN(metadata);

-- 更新时间触发器
CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON public.prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS策略
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的prompts
CREATE POLICY "Users can view own prompts"
    ON public.prompts FOR SELECT
    USING (auth.uid() = user_id);

-- 用户可以查看公开的prompts
CREATE POLICY "Anyone can view public prompts"
    ON public.prompts FOR SELECT
    USING (is_public = TRUE);

-- 用户可以创建自己的prompts
CREATE POLICY "Users can create own prompts"
    ON public.prompts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的prompts
CREATE POLICY "Users can update own prompts"
    ON public.prompts FOR UPDATE
    USING (auth.uid() = user_id);

-- 用户可以删除自己的prompts
CREATE POLICY "Users can delete own prompts"
    ON public.prompts FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 3. optimization_jobs 表 - 异步优化任务
-- =====================================================
CREATE TABLE IF NOT EXISTS public.optimization_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL,
    status job_status DEFAULT 'pending' NOT NULL,
    mode optimization_mode NOT NULL,
    provider ai_provider NOT NULL,
    original_content TEXT NOT NULL,
    iterations_total INTEGER DEFAULT 3 NOT NULL,
    current_iteration INTEGER DEFAULT 0 NOT NULL,
    result JSONB,
    error_message TEXT,
    progress_log JSONB DEFAULT '[]' NOT NULL,
    tokens_used INTEGER DEFAULT 0 NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_optimization_jobs_user_id ON public.optimization_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_optimization_jobs_status ON public.optimization_jobs(status);
CREATE INDEX IF NOT EXISTS idx_optimization_jobs_created_at ON public.optimization_jobs(created_at DESC);

-- 更新时间触发器
CREATE TRIGGER update_optimization_jobs_updated_at
    BEFORE UPDATE ON public.optimization_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS策略
ALTER TABLE public.optimization_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
    ON public.optimization_jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own jobs"
    ON public.optimization_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
    ON public.optimization_jobs FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- 4. evaluations 表 - LLM评估记录
-- =====================================================
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1 NOT NULL,
    -- COSTAR评分维度 (0-100)
    clarity_score INTEGER CHECK (clarity_score >= 0 AND clarity_score <= 100),
    constraint_score INTEGER CHECK (constraint_score >= 0 AND constraint_score <= 100),
    context_score INTEGER CHECK (context_score >= 0 AND context_score <= 100),
    format_score INTEGER CHECK (format_score >= 0 AND format_score <= 100),
    overall_score DECIMAL(5, 2) GENERATED ALWAYS AS (
        (clarity_score * 0.30 + constraint_score * 0.25 + context_score * 0.25 + format_score * 0.20)
    ) STORED,
    feedback JSONB DEFAULT '{}' NOT NULL,
    suggestions TEXT[],
    evaluator_model TEXT NOT NULL,
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_evaluations_prompt_id ON public.evaluations(prompt_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_overall_score ON public.evaluations(overall_score DESC);

-- RLS策略
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己prompts的评估
CREATE POLICY "Users can view evaluations of own prompts"
    ON public.evaluations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.prompts
            WHERE prompts.id = evaluations.prompt_id
            AND prompts.user_id = auth.uid()
        )
    );

-- 系统可以创建评估（通过service_role）
CREATE POLICY "Service can create evaluations"
    ON public.evaluations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.prompts
            WHERE prompts.id = evaluations.prompt_id
            AND prompts.user_id = auth.uid()
        )
    );

-- =====================================================
-- 5. usage_records 表 - 使用量记录
-- =====================================================
CREATE TABLE IF NOT EXISTS public.usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    quick_count INTEGER DEFAULT 0 NOT NULL,
    deep_count INTEGER DEFAULT 0 NOT NULL,
    tokens_used INTEGER DEFAULT 0 NOT NULL,
    api_calls INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- 每用户每天一条记录
    UNIQUE(user_id, date)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_date ON public.usage_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_date ON public.usage_records(user_id, date);

-- 更新时间触发器
CREATE TRIGGER update_usage_records_updated_at
    BEFORE UPDATE ON public.usage_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS策略
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
    ON public.usage_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
    ON public.usage_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
    ON public.usage_records FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- 6. 辅助函数
-- =====================================================

-- 增加用户使用量的函数
CREATE OR REPLACE FUNCTION increment_usage(
    p_user_id UUID,
    p_mode optimization_mode,
    p_tokens INTEGER DEFAULT 0
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.usage_records (user_id, date, quick_count, deep_count, tokens_used, api_calls)
    VALUES (
        p_user_id,
        CURRENT_DATE,
        CASE WHEN p_mode = 'quick' THEN 1 ELSE 0 END,
        CASE WHEN p_mode = 'deep' THEN 1 ELSE 0 END,
        p_tokens,
        1
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        quick_count = usage_records.quick_count + CASE WHEN p_mode = 'quick' THEN 1 ELSE 0 END,
        deep_count = usage_records.deep_count + CASE WHEN p_mode = 'deep' THEN 1 ELSE 0 END,
        tokens_used = usage_records.tokens_used + p_tokens,
        api_calls = usage_records.api_calls + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查用户配额的函数
CREATE OR REPLACE FUNCTION check_user_quota(
    p_user_id UUID,
    p_mode optimization_mode
)
RETURNS BOOLEAN AS $$
DECLARE
    v_tier subscription_tier;
    v_today_usage RECORD;
    v_daily_limit INTEGER;
BEGIN
    -- 获取用户订阅等级
    SELECT subscription_tier INTO v_tier
    FROM public.profiles
    WHERE id = p_user_id;

    -- 获取今日使用量
    SELECT quick_count, deep_count INTO v_today_usage
    FROM public.usage_records
    WHERE user_id = p_user_id AND date = CURRENT_DATE;

    -- 设置每日限制
    CASE v_tier
        WHEN 'free' THEN
            v_daily_limit := CASE WHEN p_mode = 'quick' THEN 10 ELSE 3 END;
        WHEN 'pro' THEN
            v_daily_limit := CASE WHEN p_mode = 'quick' THEN 100 ELSE 20 END;
        WHEN 'enterprise' THEN
            v_daily_limit := 999999; -- 无限制
        ELSE
            v_daily_limit := 10;
    END CASE;

    -- 检查是否超限
    IF v_today_usage IS NULL THEN
        RETURN TRUE;
    END IF;

    IF p_mode = 'quick' THEN
        RETURN v_today_usage.quick_count < v_daily_limit;
    ELSE
        RETURN v_today_usage.deep_count < v_daily_limit;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取用户统计信息的函数
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_prompts', (SELECT COUNT(*) FROM public.prompts WHERE user_id = p_user_id),
        'total_optimizations', (SELECT COUNT(*) FROM public.optimization_jobs WHERE user_id = p_user_id AND status = 'completed'),
        'today_quick', COALESCE((SELECT quick_count FROM public.usage_records WHERE user_id = p_user_id AND date = CURRENT_DATE), 0),
        'today_deep', COALESCE((SELECT deep_count FROM public.usage_records WHERE user_id = p_user_id AND date = CURRENT_DATE), 0),
        'avg_score', (SELECT ROUND(AVG(score)::numeric, 2) FROM public.prompts WHERE user_id = p_user_id AND score IS NOT NULL)
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. 视图（可选）
-- =====================================================

-- 用户仪表板视图
CREATE OR REPLACE VIEW public.user_dashboard AS
SELECT 
    p.id AS user_id,
    p.display_name,
    p.subscription_tier,
    p.credits,
    (SELECT COUNT(*) FROM public.prompts WHERE user_id = p.id) AS total_prompts,
    (SELECT COUNT(*) FROM public.optimization_jobs WHERE user_id = p.id AND status = 'completed') AS total_optimizations,
    COALESCE(ur.quick_count, 0) AS today_quick,
    COALESCE(ur.deep_count, 0) AS today_deep
FROM public.profiles p
LEFT JOIN public.usage_records ur ON p.id = ur.user_id AND ur.date = CURRENT_DATE;

-- =====================================================
-- 完成
-- =====================================================
COMMENT ON TABLE public.profiles IS '用户扩展信息表';
COMMENT ON TABLE public.prompts IS '提示词存储表';
COMMENT ON TABLE public.optimization_jobs IS '异步优化任务表';
COMMENT ON TABLE public.evaluations IS 'LLM评估记录表';
COMMENT ON TABLE public.usage_records IS '使用量记录表';

