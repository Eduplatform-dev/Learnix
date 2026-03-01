import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Send, Sparkles, BookOpen, Clock, Target, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hi John! How can I help you with your studies today?',
      time: '10:30 AM',
    },
    {
      id: 2,
      sender: 'user',
      text: 'Can you suggest me some study material?',
      time: '10:31 AM',
    },
    {
      id: 3,
      sender: 'ai',
      text: 'Of course! Based on your current courses and progress, here are some personalized recommendations:',
      time: '10:31 AM',
    },
  ]);

  const [inputValue, setInputValue] = useState('');

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

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'user',
          text: inputValue,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setInputValue('');

      // Simulate AI response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: 'ai',
            text: 'I understand your question. Let me provide you with some helpful information based on your learning history and current progress.',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-200 h-[700px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Study Assistant</h3>
                  <p className="text-sm text-gray-600">Powered by advanced AI - Always online</p>
                </div>
                <Badge className="ml-auto bg-green-500">Active</Badge>
              </div>
            </div>

            {/* Chat Messages */}
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
                          'JD'
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
                        <p className="text-sm">{message.text}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-2">{message.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Suggested Prompts */}
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setInputValue(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  placeholder="Type your message or question here..."
                  className="flex-1 bg-white border-gray-200"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button className="gap-2" onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Suggestions Panel */}
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

          {/* AI Study Suggestions */}
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
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${suggestion.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {suggestion.title}
                          </p>
                          <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
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
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Generate Study Plan
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Set Learning Goals
                </Button>
                <Button variant="outline" className="w-full justify-start">
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

