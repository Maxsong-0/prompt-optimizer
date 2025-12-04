"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Sparkles,
  Users,
  AtSign,
  Share2,
  MoreHorizontal,
  Smile,
  Paperclip,
  Bot,
  User,
  Clock,
  Check,
  Copy,
  Edit2,
  Trash2,
  Reply,
  ChevronDown,
} from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  type: 'text' | 'prompt' | 'ai_response' | 'system'
  promptContent?: string
  timestamp: Date
  mentions?: string[]
  reactions?: { emoji: string; users: string[] }[]
  replyTo?: {
    id: string
    userName: string
    content: string
  }
}

interface TeamMember {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'away' | 'offline'
  role: 'owner' | 'admin' | 'member'
}

const mockMembers: TeamMember[] = [
  { id: '1', name: 'John Doe', status: 'online', role: 'owner' },
  { id: '2', name: 'Alice Chen', status: 'online', role: 'admin' },
  { id: '3', name: 'Bob Smith', status: 'away', role: 'member' },
  { id: '4', name: 'Emma Wilson', status: 'offline', role: 'member' },
]

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Alice Chen',
    content: 'Hey team! I just finished optimizing the blog post prompt. Check it out! 👋',
    type: 'text',
    timestamp: new Date(Date.now() - 3600000 * 2),
    reactions: [{ emoji: '👍', users: ['John Doe', 'Bob Smith'] }],
  },
  {
    id: '2',
    userId: '2',
    userName: 'Alice Chen',
    content: 'SEO Blog Post Generator',
    type: 'prompt',
    promptContent: `You are an expert content writer specializing in SEO-optimized blog posts.

Topic: [TOPIC]
Target Audience: [AUDIENCE]
Keywords: [KEYWORDS]

Write a comprehensive, engaging blog post that:
1. Captures attention from the first sentence
2. Uses keywords naturally (2-3% density)
3. Includes compelling headings and subheadings
4. Provides actionable insights
5. Ends with a strong CTA`,
    timestamp: new Date(Date.now() - 3600000 * 1.5),
  },
  {
    id: '3',
    userId: '1',
    userName: 'John Doe',
    content: 'This looks great! @Alice Can we add a section for meta descriptions?',
    type: 'text',
    timestamp: new Date(Date.now() - 3600000),
    mentions: ['Alice Chen'],
  },
  {
    id: '4',
    userId: 'ai',
    userName: 'AI Assistant',
    content: `Great suggestion! Here's an improved version with meta description generation:

**Added Section:**
\`\`\`
Also generate a meta description that:
- Is between 150-160 characters
- Includes the primary keyword
- Has a clear value proposition
- Encourages clicks
\`\`\`

This will help improve SEO visibility in search results.`,
    type: 'ai_response',
    timestamp: new Date(Date.now() - 1800000),
    reactions: [{ emoji: '🎉', users: ['Alice Chen', 'John Doe'] }],
  },
  {
    id: '5',
    userId: '3',
    userName: 'Bob Smith',
    content: 'Perfect! I\'ll use this for our next marketing campaign.',
    type: 'text',
    timestamp: new Date(Date.now() - 600000),
  },
]

const EMOJI_LIST = ['👍', '❤️', '🎉', '🚀', '👏', '🔥', '💡', '✅']

export default function TeamChatPage() {
  const { language } = useLanguage()
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [inputValue, setInputValue] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const [isAITyping, setIsAITyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const isAICommand = inputValue.startsWith('@AI ') || inputValue.startsWith('@ai ')

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: '1',
      userName: 'John Doe',
      content: inputValue,
      type: 'text',
      timestamp: new Date(),
      replyTo: replyingTo ? {
        id: replyingTo.id,
        userName: replyingTo.userName,
        content: replyingTo.content.slice(0, 50) + (replyingTo.content.length > 50 ? '...' : ''),
      } : undefined,
    }

    setMessages([...messages, newMessage])
    setInputValue('')
    setReplyingTo(null)

    // Simulate AI response
    if (isAICommand) {
      setIsAITyping(true)
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          userId: 'ai',
          userName: 'AI Assistant',
          content: `Based on the team's discussion, here are my suggestions:\n\n1. **Improve clarity** - Add more specific instructions\n2. **Add examples** - Include sample outputs\n3. **Structure** - Use clear sections with headers\n\nWould you like me to generate an optimized version?`,
          type: 'ai_response',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiResponse])
        setIsAITyping(false)
      }, 2000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === '@') {
      setShowMentions(true)
    }
  }

  const insertMention = (member: TeamMember) => {
    setInputValue(prev => prev + `@${member.name} `)
    setShowMentions(false)
    inputRef.current?.focus()
  }

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id !== messageId) return msg
      const existingReaction = msg.reactions?.find(r => r.emoji === emoji)
      if (existingReaction) {
        if (existingReaction.users.includes('John Doe')) {
          // Remove reaction
          return {
            ...msg,
            reactions: msg.reactions?.map(r => 
              r.emoji === emoji 
                ? { ...r, users: r.users.filter(u => u !== 'John Doe') }
                : r
            ).filter(r => r.users.length > 0)
          }
        } else {
          // Add to existing
          return {
            ...msg,
            reactions: msg.reactions?.map(r =>
              r.emoji === emoji
                ? { ...r, users: [...r.users, 'John Doe'] }
                : r
            )
          }
        }
      } else {
        // New reaction
        return {
          ...msg,
          reactions: [...(msg.reactions || []), { emoji, users: ['John Doe'] }]
        }
      }
    }))
    setShowEmoji(false)
    setSelectedMessageId(null)
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const onlineCount = mockMembers.filter(m => m.status === 'online').length

  return (
    <motion.div
      className="flex flex-col h-screen"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.header
        className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {language === 'zh' ? '团队聊天' : 'Team Chat'}
            </h1>
            <p className="text-xs text-foreground-muted">
              {onlineCount} {language === 'zh' ? '人在线' : 'online'} · {mockMembers.length} {language === 'zh' ? '位成员' : 'members'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {mockMembers.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "group flex gap-3",
              message.type === 'system' && "justify-center"
            )}
            onMouseEnter={() => setSelectedMessageId(message.id)}
            onMouseLeave={() => {
              if (!showEmoji) setSelectedMessageId(null)
            }}
          >
            {message.type !== 'system' && (
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarImage src={message.userAvatar} />
                <AvatarFallback className={cn(
                  "text-sm text-white",
                  message.type === 'ai_response'
                    ? "bg-gradient-to-br from-purple-500 to-pink-500"
                    : "bg-gradient-to-br from-primary to-accent"
                )}>
                  {message.type === 'ai_response' ? <Bot className="w-5 h-5" /> : message.userName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            )}

            <div className={cn(
              "flex-1 max-w-2xl",
              message.type === 'system' && "max-w-md"
            )}>
              {message.type !== 'system' && (
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "font-medium text-sm",
                    message.type === 'ai_response' ? "text-purple-400" : "text-foreground"
                  )}>
                    {message.userName}
                  </span>
                  <span className="text-xs text-foreground-muted">{formatTime(message.timestamp)}</span>
                </div>
              )}

              {/* Reply indicator */}
              {message.replyTo && (
                <div className="flex items-center gap-2 mb-2 pl-3 border-l-2 border-foreground-muted/30">
                  <Reply className="w-3 h-3 text-foreground-muted" />
                  <span className="text-xs text-foreground-muted">
                    {message.replyTo.userName}: {message.replyTo.content}
                  </span>
                </div>
              )}

              {/* Message content */}
              {message.type === 'prompt' ? (
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">{message.content}</span>
                  </div>
                  <pre className="text-xs text-foreground-secondary bg-surface/50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {message.promptContent}
                  </pre>
                  <div className="flex items-center gap-2 mt-3">
                    <GradientButton size="sm" onClick={() => copyMessage(message.promptContent || '')}>
                      <Copy className="w-3 h-3 mr-1" />
                      {language === 'zh' ? '复制' : 'Copy'}
                    </GradientButton>
                    <GradientButton variant="secondary" size="sm">
                      {language === 'zh' ? '使用模板' : 'Use Template'}
                    </GradientButton>
                  </div>
                </div>
              ) : message.type === 'ai_response' ? (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <div className="prose prose-sm prose-invert max-w-none">
                    <p className="text-sm text-foreground-secondary whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ) : message.type === 'system' ? (
                <div className="px-4 py-2 rounded-full bg-surface text-xs text-foreground-muted text-center">
                  {message.content}
                </div>
              ) : (
                <p className="text-sm text-foreground-secondary">{message.content}</p>
              )}

              {/* Reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  {message.reactions.map((reaction) => (
                    <button
                      key={reaction.emoji}
                      onClick={() => addReaction(message.id, reaction.emoji)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                        reaction.users.includes('John Doe')
                          ? "bg-accent/20 text-accent"
                          : "bg-surface hover:bg-surface-hover text-foreground-muted"
                      )}
                    >
                      <span>{reaction.emoji}</span>
                      <span>{reaction.users.length}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <AnimatePresence>
                {selectedMessageId === message.id && message.type !== 'system' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-1 mt-2"
                  >
                    <div className="relative">
                      <button
                        onClick={() => setShowEmoji(!showEmoji)}
                        className="p-1.5 rounded-lg hover:bg-surface transition-colors"
                      >
                        <Smile className="w-4 h-4 text-foreground-muted" />
                      </button>
                      {showEmoji && selectedMessageId === message.id && (
                        <div className="absolute bottom-full left-0 mb-2 p-2 rounded-lg bg-card border border-border shadow-lg flex gap-1">
                          {EMOJI_LIST.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => addReaction(message.id, emoji)}
                              className="p-1 hover:bg-surface rounded transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setReplyingTo(message)}
                      className="p-1.5 rounded-lg hover:bg-surface transition-colors"
                    >
                      <Reply className="w-4 h-4 text-foreground-muted" />
                    </button>
                    <button
                      onClick={() => copyMessage(message.content)}
                      className="p-1.5 rounded-lg hover:bg-surface transition-colors"
                    >
                      <Copy className="w-4 h-4 text-foreground-muted" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}

        {/* AI Typing Indicator */}
        {isAITyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <Bot className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-purple-400">AI is thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-6 py-2 bg-surface border-t border-border flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Reply className="w-4 h-4 text-accent" />
              <span className="text-sm text-foreground-muted">
                {language === 'zh' ? '回复' : 'Replying to'} <strong>{replyingTo.userName}</strong>
              </span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-surface-hover rounded">
              <ChevronDown className="w-4 h-4 text-foreground-muted" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background/80 backdrop-blur-xl">
        <div className="relative">
          {/* Mentions dropdown */}
          <AnimatePresence>
            {showMentions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 mb-2 w-64 p-2 rounded-xl bg-card border border-border shadow-lg"
              >
                <p className="px-2 py-1 text-xs font-medium text-foreground-muted">
                  {language === 'zh' ? '提及成员' : 'Mention a member'}
                </p>
                {mockMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => insertMention(member)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface transition-colors"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{member.name}</span>
                    <span className={cn(
                      "ml-auto w-2 h-2 rounded-full",
                      member.status === 'online' && "bg-success",
                      member.status === 'away' && "bg-warning",
                      member.status === 'offline' && "bg-foreground-muted"
                    )} />
                  </button>
                ))}
                <button
                  onClick={() => {
                    setInputValue(prev => prev + '@AI ')
                    setShowMentions(false)
                  }}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface transition-colors border-t border-border mt-2 pt-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-foreground">AI Assistant</span>
                  <span className="ml-auto text-xs text-accent">@AI</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  if (e.target.value.endsWith('@')) {
                    setShowMentions(true)
                  } else if (!e.target.value.includes('@')) {
                    setShowMentions(false)
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={language === 'zh' ? '输入消息... 使用 @AI 呼叫AI助手' : 'Type a message... Use @AI to call AI assistant'}
                rows={1}
                className="w-full px-4 py-3 pr-24 rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button
                  onClick={() => setShowMentions(!showMentions)}
                  className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <AtSign className="w-4 h-4 text-foreground-muted" />
                </button>
                <button className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
                  <Paperclip className="w-4 h-4 text-foreground-muted" />
                </button>
              </div>
            </div>
            <GradientButton onClick={handleSend} disabled={!inputValue.trim()}>
              <Send className="w-4 h-4" />
            </GradientButton>
          </div>

          <p className="mt-2 text-xs text-foreground-muted text-center">
            {language === 'zh' 
              ? '按 Enter 发送，Shift + Enter 换行'
              : 'Press Enter to send, Shift + Enter for new line'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

