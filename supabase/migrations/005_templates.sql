-- =====================================================
-- 005_templates.sql - 模板系统数据库表
-- 创建日期: 2025-12-04
-- 功能: 存储用户创建和系统预设的提示词模板
-- =====================================================

-- 创建模板分类枚举
DO $$ BEGIN
    CREATE TYPE template_category AS ENUM ('writing', 'coding', 'marketing', 'business', 'image', 'education', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 模板表
-- =====================================================
CREATE TABLE IF NOT EXISTS templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 基本信息
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL 表示系统模板
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    
    -- 分类和标签
    category template_category DEFAULT 'custom',
    tags JSONB DEFAULT '[]'::jsonb,
    
    -- 可见性
    is_public BOOLEAN DEFAULT false,  -- 是否公开给所有用户
    is_system BOOLEAN DEFAULT false,  -- 是否是系统预设模板
    
    -- 统计数据
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,  -- 0.00 - 5.00
    rating_count INTEGER DEFAULT 0,
    
    -- 元数据
    variables JSONB DEFAULT '[]'::jsonb,  -- 模板中的变量占位符
    metadata JSONB DEFAULT '{}'::jsonb,   -- 其他元数据（作者信息等）
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 用户收藏模板关联表
-- =====================================================
CREATE TABLE IF NOT EXISTS user_favorite_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(user_id, template_id)
);

-- =====================================================
-- 模板使用记录表
-- =====================================================
CREATE TABLE IF NOT EXISTS template_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    used_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 索引
-- =====================================================

-- 模板表索引
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_is_system ON templates(is_system);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_usage_count ON templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_templates_tags ON templates USING GIN(tags);

-- 收藏表索引
CREATE INDEX IF NOT EXISTS idx_user_favorite_templates_user_id ON user_favorite_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_templates_template_id ON user_favorite_templates(template_id);

-- 使用记录索引
CREATE INDEX IF NOT EXISTS idx_template_usage_user_id ON template_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_template_id ON template_usage(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_used_at ON template_usage(used_at DESC);

-- =====================================================
-- 触发器：自动更新 updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_templates_updated_at ON templates;
CREATE TRIGGER trigger_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_templates_updated_at();

-- =====================================================
-- 函数：增加模板使用计数
-- =====================================================
CREATE OR REPLACE FUNCTION increment_template_usage(p_template_id UUID, p_user_id UUID)
RETURNS void AS $$
BEGIN
    -- 更新使用计数
    UPDATE templates 
    SET usage_count = usage_count + 1
    WHERE id = p_template_id;
    
    -- 记录使用
    INSERT INTO template_usage (user_id, template_id)
    VALUES (p_user_id, p_template_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 函数：获取用户可见的模板
-- =====================================================
CREATE OR REPLACE FUNCTION get_visible_templates(p_user_id UUID)
RETURNS SETOF templates AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM templates
    WHERE 
        is_public = true 
        OR is_system = true
        OR user_id = p_user_id
    ORDER BY 
        is_system DESC,
        usage_count DESC,
        created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS 策略
-- =====================================================

-- 启用 RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;

-- templates 策略

-- 查看：用户可以看到公开模板、系统模板和自己的模板
CREATE POLICY "Users can view visible templates"
    ON templates FOR SELECT
    USING (
        is_public = true 
        OR is_system = true 
        OR user_id = auth.uid()
    );

-- 创建：用户可以创建自己的模板
CREATE POLICY "Users can create own templates"
    ON templates FOR INSERT
    WITH CHECK (
        user_id = auth.uid() 
        AND is_system = false
    );

-- 更新：用户只能更新自己的模板
CREATE POLICY "Users can update own templates"
    ON templates FOR UPDATE
    USING (user_id = auth.uid() AND is_system = false)
    WITH CHECK (user_id = auth.uid() AND is_system = false);

-- 删除：用户只能删除自己的模板
CREATE POLICY "Users can delete own templates"
    ON templates FOR DELETE
    USING (user_id = auth.uid() AND is_system = false);

-- user_favorite_templates 策略

CREATE POLICY "Users can view own favorites"
    ON user_favorite_templates FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites"
    ON user_favorite_templates FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove favorites"
    ON user_favorite_templates FOR DELETE
    USING (user_id = auth.uid());

-- template_usage 策略

CREATE POLICY "Users can view own usage"
    ON template_usage FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can record usage"
    ON template_usage FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 插入系统预设模板
-- =====================================================
INSERT INTO templates (title, description, content, category, tags, is_public, is_system, metadata)
VALUES
(
    'Blog Post Writer',
    'Generate engaging blog posts with proper structure and SEO optimization.',
    E'You are an expert content writer specializing in creating engaging, SEO-optimized blog posts.\n\nYour task is to write a blog post on the topic: [TOPIC]\n\nFollow these guidelines:\n1. Start with an attention-grabbing headline\n2. Include a compelling introduction that hooks the reader\n3. Use clear subheadings to organize content (H2, H3)\n4. Include relevant keywords naturally throughout\n5. Add bullet points or numbered lists for easy scanning\n6. End with a strong call-to-action\n\nTarget audience: [AUDIENCE]\nTone: [TONE - professional/casual/friendly]\nWord count: [WORD_COUNT]',
    'writing',
    '["Blog", "SEO", "Content"]'::jsonb,
    true,
    true,
    '{"author": "Promto Team", "version": "1.0"}'::jsonb
),
(
    'Code Reviewer',
    'Get detailed code reviews with suggestions for improvement.',
    E'Act as a senior software engineer conducting a thorough code review.\n\nAnalyze the following code and provide:\n1. A summary of what the code does\n2. Potential bugs or issues\n3. Security vulnerabilities\n4. Performance improvements\n5. Code style and best practice suggestions\n6. Refactoring recommendations\n\nBe specific and provide code examples when suggesting improvements.\n\nCode to review:\n```\n[PASTE YOUR CODE HERE]\n```',
    'coding',
    '["Review", "Best Practices"]'::jsonb,
    true,
    true,
    '{"author": "Promto Team", "version": "1.0"}'::jsonb
),
(
    'Email Composer',
    'Craft professional emails for any occasion.',
    E'You are a professional communication specialist. Write an email with the following details:\n\nPurpose: [PURPOSE - follow-up/introduction/request/thank you]\nRecipient: [RECIPIENT - colleague/client/manager]\nTone: [TONE - formal/semi-formal/friendly]\nKey points to include:\n- [POINT 1]\n- [POINT 2]\n- [POINT 3]\n\nThe email should be concise, clear, and professional while maintaining a [TONE] tone.',
    'business',
    '["Email", "Communication"]'::jsonb,
    true,
    true,
    '{"author": "Promto Team", "version": "1.0"}'::jsonb
),
(
    'Midjourney Art Prompt',
    'Create detailed prompts for stunning AI-generated artwork.',
    E'Generate a detailed Midjourney prompt for the following concept:\n\nSubject: [SUBJECT]\nStyle: [STYLE - photorealistic/anime/oil painting/digital art]\nMood: [MOOD - dramatic/peaceful/mysterious/vibrant]\nLighting: [LIGHTING - golden hour/studio/neon/natural]\nCamera angle: [ANGLE - close-up/wide shot/bird''s eye]\n\nFormat the output as:\n[subject description], [style], [mood], [lighting], [camera angle], [additional details] --ar [aspect ratio] --v 5.2',
    'image',
    '["Art", "Midjourney", "Creative"]'::jsonb,
    true,
    true,
    '{"author": "Promto Team", "version": "1.0"}'::jsonb
),
(
    'Product Description',
    'Write compelling product descriptions that convert.',
    E'Create a compelling product description for an e-commerce listing.\n\nProduct: [PRODUCT NAME]\nCategory: [CATEGORY]\nKey Features:\n- [FEATURE 1]\n- [FEATURE 2]\n- [FEATURE 3]\n\nTarget audience: [TARGET AUDIENCE]\nUnique selling points: [USPs]\n\nWrite a description that:\n1. Hooks the reader in the first sentence\n2. Highlights benefits over features\n3. Uses sensory language\n4. Includes a call-to-action\n5. Is optimized for SEO with natural keyword placement',
    'marketing',
    '["E-commerce", "Copywriting"]'::jsonb,
    true,
    true,
    '{"author": "Promto Team", "version": "1.0"}'::jsonb
),
(
    'Technical Documentation',
    'Create clear and comprehensive technical docs.',
    E'Write technical documentation for the following:\n\nComponent/Feature: [NAME]\nType: [API/Component/Function/System]\nPurpose: [BRIEF DESCRIPTION]\n\nInclude:\n1. Overview/Introduction\n2. Prerequisites/Requirements\n3. Installation/Setup (if applicable)\n4. Usage examples with code snippets\n5. API reference/Props (if applicable)\n6. Common use cases\n7. Troubleshooting section\n8. Related resources\n\nUse clear, concise language suitable for developers of all skill levels.',
    'coding',
    '["Docs", "Technical"]'::jsonb,
    true,
    true,
    '{"author": "Promto Team", "version": "1.0"}'::jsonb
)
ON CONFLICT DO NOTHING;

