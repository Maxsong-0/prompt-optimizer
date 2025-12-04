-- =====================================================
-- Migration: 003_user_profile_fields
-- Description: 添加用户 profile 扩展字段（姓、名、手机号）
-- Date: 2025-12-04
-- =====================================================

-- 添加 first_name 字段（名）
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT;

-- 添加 last_name 字段（姓）
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 添加 phone 字段（手机号，可选）
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 添加索引以优化按手机号查询
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone) WHERE phone IS NOT NULL;

-- 更新 handle_new_user 触发器函数以支持新字段
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 添加字段注释
COMMENT ON COLUMN public.profiles.first_name IS '用户名（名字）';
COMMENT ON COLUMN public.profiles.last_name IS '用户姓（姓氏）';
COMMENT ON COLUMN public.profiles.phone IS '用户手机号（可选）';

-- =====================================================
-- 完成
-- =====================================================

