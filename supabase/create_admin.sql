-- =====================================================
-- 创建管理员账号脚本
-- 使用方法：
-- 1. 先通过OAuth或邮箱登录创建账号
-- 2. 获取用户的email或ID
-- 3. 运行此脚本提升权限
-- =====================================================

-- 方法1: 通过邮箱设置管理员
-- 将 'your-email@example.com' 替换为你的真实邮箱
UPDATE public.profiles 
SET 
    role = 'admin',
    subscription_tier = 'enterprise',
    credits = 99999
WHERE email = 'maxsong5020@gmail.com';

-- 方法2: 通过用户ID设置管理员（如果你知道user id）
-- UPDATE public.profiles 
-- SET 
--     role = 'admin',
--     subscription_tier = 'enterprise',
--     credits = 99999
-- WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

-- 查看所有用户
-- SELECT id, email, display_name, role, subscription_tier FROM public.profiles;

-- 验证管理员设置成功
SELECT 
    id,
    email,
    display_name,
    role,
    subscription_tier,
    credits
FROM public.profiles
WHERE role = 'admin';

