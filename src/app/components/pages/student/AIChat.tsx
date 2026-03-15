import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Send, Sparkles, BookOpen, Clock, Target, TrendingUp, StopCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

/* ================= TYPES ================= */
type MessageSender = 'ai' | 'user';

type Message = {
  id: number;
  sender: MessageSender;
  text: string;
  time: string;
  isStreaming?: boolean;
};

/* ================= HELPERS ================= */
const now = () =>
  new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

const SYSTEM_PROMPT = `You are an intelligent AI Study Assistant for Learnix, a Learning Management System. 
Your role is to help students with:
- Study plans and learning strategies
- Explaining concepts from their courses (React, Data Structures, Algorithms, Databases, etc.)
- Assignment help and guidance (without doing the work for them)
- Time management and productivity tips
- Exam preparation strategies
- Motivation and overcoming learning challenges

Keep responses concise, friendly, and educational. Use bullet points and structure when helpful.
If asked something unrelated to studying/learning, gently redirect to academic topics.`;

/* ================= COMPONENT ================= */
export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Hi! I'm your AI Study Assistant powered by Claude. I can help you with study plans, explain concepts, assist with assignments, and more. What would you like to learn today?",
      time: now(),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ================= SUGGESTED PROMPTS ================= */
  const suggestedPrompts = [
    'Study tips',
    'Course plan',
    'Assignment help',
    'Priority tasks',
  ];

  const studySuggestions = [
    {
      id: 1,
      title: 'React Hooks Best Practices',
      description: 'Based on your current course',
      type: 'Article',
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 2,
      title: 'Focus on Data Structures',
      description: 'Recommended for upcoming exam',
      type: 'Course',
      icon: Target,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 3,
      title: 'Practice Algorithms Daily',
      description: 'Improve problem-solving skills',
      type: 'Practice',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 4,
      title: 'Time Management Tips',
      description: 'Optimize your study schedule',
      type: 'Guide',
      icon: Clock,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  /* ================= STOP STREAMING ================= */
  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    // Finalize the streaming message
    setMessages((prev) =>
      prev.map((m) =>
        m.isStreaming ? { ...m, isStreaming: false } : m
      )
    );
  };

  /* ================= SEND MESSAGE ================= */
  const handleSendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? inputValue).trim();
    if (!text || isLoading) return;

    setError(null);
    setInputValue('');

    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text,
      time: now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Placeholder streaming message
    const aiMsgId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      {
        id: aiMsgId,
        sender: 'ai',
        text: '',
        time: now(),
        isStreaming: true,
      },
    ]);

    // Build conversation history for the API
    const conversationHistory = [
      ...messages,
      userMsg,
    ]
      .filter((m) => !m.isStreaming)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          stream: true,
          messages: conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              if (
                parsed.type === 'content_block_delta' &&
                parsed.delta?.type === 'text_delta'
              ) {
                accumulated += parsed.delta.text;

                // Update the streaming message
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? { ...m, text: accumulated }
                      : m
                  )
                );
              }
            } catch {
              // Ignore JSON parse errors for partial chunks
            }
          }
        }
      }

      // Finalize message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // User stopped — already handled
        return;
      }

      console.error('AI Chat error:', err);
      setError('Failed to get a response. Please try again.');

      // Replace the empty streaming message with an error
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text: "Sorry, I couldn't process your message. Please try again.",
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ================= CHAT PANEL ================= */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-200 h-[700px] flex flex-col">

            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Study Assistant</h3>
                  <p className="text-sm text-gray-600">Powered by Claude · Always online</p>
                </div>
                <Badge className="ml-auto bg-green-500">Active</Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback
                        className={
                          message.sender === 'ai'
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                            : 'bg-indigo-100 text-indigo-600'
                        }
                      >
                        {message.sender === 'ai' ? (
                          <Sparkles className="w-4 h-4" />
                        ) : (
                          'Me'
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.sender === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {/* Render text with line breaks */}
                        {message.text ? (
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        ) : (
                          /* Typing indicator while streaming but no text yet */
                          <div className="flex gap-1 items-center h-5">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                          </div>
                        )}

                        {/* Streaming cursor */}
                        {message.isStreaming && message.text && (
                          <span className="inline-block w-0.5 h-4 bg-gray-500 ml-0.5 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-2">{message.time}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Error banner */}
              {error && (
                <div className="text-center text-sm text-red-500 bg-red-50 rounded-lg p-2">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            <div className="px-6 pb-3">
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={isLoading}
                    onClick={() => handleSendMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  placeholder="Type your message or question here..."
                  className="flex-1 bg-white border-gray-200"
                  value={inputValue}
                  disabled={isLoading}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                {isLoading ? (
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={handleStop}
                  >
                    <StopCircle className="w-4 h-4" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    className="gap-2"
                    disabled={!inputValue.trim()}
                    onClick={() => handleSendMessage()}
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* ================= SIDEBAR ================= */}
        <div className="lg:col-span-1 space-y-6">

          {/* Chat History */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Chat History</h3>
              <div className="space-y-2">
                {[
                  { title: 'Study plan for React', date: 'Today' },
                  { title: 'Assignment help', date: 'Yesterday' },
                  { title: 'Exam preparation', date: '2 days ago' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">AI Suggestions</h3>
              </div>
              <div className="space-y-3">
                {studySuggestions.map((suggestion) => {
                  const Icon = suggestion.icon;
                  return (
                    <div
                      key={suggestion.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-all"
                      onClick={() =>
                        handleSendMessage(
                          `Tell me about: ${suggestion.title}`
                        )
                      }
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 ${suggestion.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {suggestion.title}
                          </p>
                          <p className="text-xs text-gray-600 mb-2">
                            {suggestion.description}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={isLoading}
                  onClick={() =>
                    handleSendMessage(
                      'Create a personalized weekly study plan for me based on typical CS courses'
                    )
                  }
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Generate Study Plan
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={isLoading}
                  onClick={() =>
                    handleSendMessage(
                      'Help me set SMART learning goals for this semester'
                    )
                  }
                >
                  <Target className="w-4 h-4 mr-2" />
                  Set Learning Goals
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={isLoading}
                  onClick={() =>
                    handleSendMessage(
                      'Give me tips on how to track and improve my academic progress'
                    )
                  }
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Track Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
