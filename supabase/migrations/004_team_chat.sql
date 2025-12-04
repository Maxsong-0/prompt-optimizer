-- =====================================================
-- Promto 团队聊天功能迁移
-- 版本: 004
-- 日期: 2025-12-04
-- 说明: 创建团队和聊天相关表结构
-- =====================================================

-- =====================================================
-- 1. teams 表 - 团队信息
-- =====================================================
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
    settings JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON public.teams(invite_code);

-- 更新时间触发器
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS策略
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view team"
    ON public.teams FOR SELECT
    USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_members.team_id = teams.id
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Team owner can update team"
    ON public.teams FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can create teams"
    ON public.teams FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owner can delete team"
    ON public.teams FOR DELETE
    USING (auth.uid() = owner_id);

-- =====================================================
-- 2. team_members 表 - 团队成员
-- =====================================================
CREATE TYPE team_member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE team_member_status AS ENUM ('active', 'pending', 'inactive');

CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role team_member_role DEFAULT 'member' NOT NULL,
    status team_member_status DEFAULT 'pending' NOT NULL,
    joined_at TIMESTAMPTZ,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(team_id, user_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);

-- 更新时间触发器
CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS策略
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view members"
    ON public.team_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_members.team_id
            AND tm.user_id = auth.uid()
        )
    );

CREATE POLICY "Team admin can manage members"
    ON public.team_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_members.team_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
        )
    );

-- =====================================================
-- 3. team_messages 表 - 团队聊天消息
-- =====================================================
CREATE TYPE message_type AS ENUM ('text', 'prompt', 'ai_response', 'system');

CREATE TABLE IF NOT EXISTS public.team_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text' NOT NULL,
    -- 如果是分享的Prompt
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL,
    -- 如果是回复其他消息
    reply_to_id UUID REFERENCES public.team_messages(id) ON DELETE SET NULL,
    -- 被提及的用户
    mentions UUID[] DEFAULT '{}',
    -- 附加元数据（如AI模型信息等）
    metadata JSONB DEFAULT '{}' NOT NULL,
    -- 消息是否已编辑
    is_edited BOOLEAN DEFAULT FALSE NOT NULL,
    edited_at TIMESTAMPTZ,
    -- 消息是否已删除（软删除）
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_team_messages_team_id ON public.team_messages(team_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_user_id ON public.team_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_created_at ON public.team_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_messages_prompt_id ON public.team_messages(prompt_id) WHERE prompt_id IS NOT NULL;

-- 更新时间触发器
CREATE TRIGGER update_team_messages_updated_at
    BEFORE UPDATE ON public.team_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS策略
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view messages"
    ON public.team_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_members.team_id = team_messages.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.status = 'active'
        )
    );

CREATE POLICY "Team members can send messages"
    ON public.team_messages FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_members.team_id = team_messages.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.status = 'active'
        )
    );

CREATE POLICY "Users can update own messages"
    ON public.team_messages FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
    ON public.team_messages FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 4. team_message_reactions 表 - 消息反应（表情）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.team_message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.team_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(message_id, user_id, emoji)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_team_message_reactions_message_id ON public.team_message_reactions(message_id);

-- RLS策略
ALTER TABLE public.team_message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view reactions"
    ON public.team_message_reactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_messages tm
            JOIN public.team_members tmem ON tm.team_id = tmem.team_id
            WHERE tm.id = team_message_reactions.message_id
            AND tmem.user_id = auth.uid()
        )
    );

CREATE POLICY "Team members can add reactions"
    ON public.team_message_reactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
    ON public.team_message_reactions FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 5. 辅助函数
-- =====================================================

-- 获取团队成员列表
CREATE OR REPLACE FUNCTION get_team_members_with_profiles(p_team_id UUID)
RETURNS TABLE (
    member_id UUID,
    user_id UUID,
    role team_member_role,
    status team_member_status,
    display_name TEXT,
    avatar_url TEXT,
    email TEXT,
    joined_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tm.id AS member_id,
        tm.user_id,
        tm.role,
        tm.status,
        p.display_name,
        p.avatar_url,
        p.email,
        tm.joined_at
    FROM public.team_members tm
    JOIN public.profiles p ON tm.user_id = p.id
    WHERE tm.team_id = p_team_id
    ORDER BY 
        CASE tm.role 
            WHEN 'owner' THEN 1 
            WHEN 'admin' THEN 2 
            ELSE 3 
        END,
        tm.joined_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 发送系统消息
CREATE OR REPLACE FUNCTION send_system_message(
    p_team_id UUID,
    p_content TEXT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_message_id UUID;
BEGIN
    INSERT INTO public.team_messages (team_id, user_id, content, message_type, metadata)
    VALUES (p_team_id, NULL, p_content, 'system', p_metadata)
    RETURNING id INTO v_message_id;
    
    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. 实时订阅支持
-- =====================================================

-- 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;

-- =====================================================
-- 完成
-- =====================================================
COMMENT ON TABLE public.teams IS '团队信息表';
COMMENT ON TABLE public.team_members IS '团队成员表';
COMMENT ON TABLE public.team_messages IS '团队聊天消息表';
COMMENT ON TABLE public.team_message_reactions IS '消息反应表';

