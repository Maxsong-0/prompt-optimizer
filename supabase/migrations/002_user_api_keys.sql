-- =====================================================
-- 用户 API Key 配置迁移
-- 版本: 002
-- 日期: 2025-12-03
-- 说明: 添加用户自定义 API Key 存储表
-- =====================================================

-- =====================================================
-- 1. AI Provider 枚举扩展
-- =====================================================

-- 删除旧枚举并重建（添加 gemini 和 openrouter）
ALTER TYPE ai_provider ADD VALUE IF NOT EXISTS 'gemini';
ALTER TYPE ai_provider ADD VALUE IF NOT EXISTS 'openrouter';

-- =====================================================
-- 2. 用户 API Key 配置表
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'gemini', 'openrouter')),
    -- API Key 加密存储（使用 pgcrypto 扩展）
    api_key_encrypted TEXT NOT NULL,
    -- Key 的显示名称（可选）
    display_name TEXT,
    -- 是否启用
    is_active BOOLEAN DEFAULT true NOT NULL,
    -- 最后验证时间
    last_validated_at TIMESTAMPTZ,
    -- 验证状态
    is_valid BOOLEAN DEFAULT true,
    -- 元数据（可存储额外信息如配额等）
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- 每个用户每个 provider 只能有一个 key
    UNIQUE(user_id, provider)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON public.user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_provider ON public.user_api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_active ON public.user_api_keys(user_id, is_active) WHERE is_active = true;

-- 更新时间触发器
CREATE TRIGGER update_user_api_keys_updated_at
    BEFORE UPDATE ON public.user_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. Row Level Security (RLS)
-- =====================================================

ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的 API Keys
CREATE POLICY "Users can view own api keys"
    ON public.user_api_keys FOR SELECT
    USING (auth.uid() = user_id);

-- 用户只能插入自己的 API Keys
CREATE POLICY "Users can insert own api keys"
    ON public.user_api_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的 API Keys
CREATE POLICY "Users can update own api keys"
    ON public.user_api_keys FOR UPDATE
    USING (auth.uid() = user_id);

-- 用户只能删除自己的 API Keys
CREATE POLICY "Users can delete own api keys"
    ON public.user_api_keys FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 4. 用户默认 Provider 设置
-- =====================================================

-- 在 profiles 表中添加默认 provider 字段
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS default_ai_provider TEXT DEFAULT 'openrouter' 
CHECK (default_ai_provider IN ('openai', 'anthropic', 'gemini', 'openrouter'));

-- =====================================================
-- 5. 辅助函数
-- =====================================================

-- 获取用户的活跃 API Key（返回脱敏信息）
CREATE OR REPLACE FUNCTION get_user_api_keys_info(p_user_id UUID)
RETURNS TABLE (
    provider TEXT,
    is_configured BOOLEAN,
    is_active BOOLEAN,
    is_valid BOOLEAN,
    display_name TEXT,
    last_validated_at TIMESTAMPTZ,
    masked_key TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        k.provider,
        true AS is_configured,
        k.is_active,
        k.is_valid,
        k.display_name,
        k.last_validated_at,
        -- 脱敏显示：显示前4位和后4位
        CASE 
            WHEN LENGTH(k.api_key_encrypted) > 8 
            THEN SUBSTRING(k.api_key_encrypted, 1, 4) || '••••••••' || SUBSTRING(k.api_key_encrypted, LENGTH(k.api_key_encrypted) - 3)
            ELSE '••••••••'
        END AS masked_key
    FROM public.user_api_keys k
    WHERE k.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查用户是否配置了某个 provider
CREATE OR REPLACE FUNCTION has_api_key(p_user_id UUID, p_provider TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_api_keys
        WHERE user_id = p_user_id 
        AND provider = p_provider 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. 注释
-- =====================================================

COMMENT ON TABLE public.user_api_keys IS '用户自定义 API Key 存储表';
COMMENT ON COLUMN public.user_api_keys.api_key_encrypted IS 'API Key（应用层加密存储）';
COMMENT ON COLUMN public.user_api_keys.is_valid IS '最后一次验证是否有效';

