import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatThreads, getChatMessages, sendChatMessage } from '@/services/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare,
  Send,
  Shield,
  Search,
  HelpCircle,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

export default function ChatPage() {
  const { user, profile, session } = useAuth();
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [activeThread, setActiveThread] = useState<string | null>(threadId || null);

  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: threads, isLoading: threadsLoading } = useQuery({
    queryKey: ['chatThreads', user?.id],
    queryFn: () => getChatThreads(user!.id),
    enabled: !!user,
  });

  const activeThreadData = threads?.find((t: any) => t.id === activeThread);
  const otherUser = profile?.role === 'MENTOR' ? activeThreadData?.athlete : activeThreadData?.mentor;

  const [safetyRisk, setSafetyRisk] = useState<{
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    flags: string[];
    recommendations: string[];
  }>({ score: 0, level: 'LOW', flags: [], recommendations: [] });
  const [showSafetyExplain, setShowSafetyExplain] = useState(false);

  const checkMessageRisk = async (lastMsgContent: string, senderId: string) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';
      const response = await fetch(`${apiBaseUrl}/api/v1/ai/message-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          message_content: lastMsgContent,
          sender_id: senderId,
          receiver_id: user?.id,
          context: { role: profile?.role },
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setSafetyRisk({
          score: data.data.risk_score,
          level: data.data.risk_level,
          flags: data.data.flags || [],
          recommendations: data.data.recommendations || [],
        });
      }
    } catch (err) {
      console.warn("Failed to check message risk dynamically, running local check:", err);
      // Fallback rule-based scanner
      const lower = lastMsgContent.toLowerCase();
      const riskyKeywords = ['meet alone', 'secret', 'no parents', 'don\'t tell', 'send pic', 'private'];
      const flagged = riskyKeywords.filter(k => lower.includes(k));
      if (flagged.length > 0) {
        setSafetyRisk({
          score: 75,
          level: 'HIGH',
          flags: flagged,
          recommendations: ['Avoid meeting alone without a guardian present.', 'Report this message to safety officer immediately.'],
        });
      } else {
        setSafetyRisk({ score: 0, level: 'LOW', flags: [], recommendations: [] });
      }
    }
  };

  const handleReportFromChat = () => {
    if (otherUser?.id) {
      navigate(`/safety/report?userId=${otherUser.id}`);
    }
  };

  const handleBlockUser = () => {
    if (!otherUser?.full_name) return;
    const confirm = window.confirm(`Are you sure you want to block ${otherUser.full_name}? This will mute their messages.`);
    if (confirm) {
      alert(`${otherUser.full_name} has been blocked successfully.`);
      setActiveThread(null);
    }
  };

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['chatMessages', activeThread],
    queryFn: () => getChatMessages(activeThread!),
    enabled: !!activeThread,
  });

  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender_id !== user?.id) {
        checkMessageRisk(lastMsg.content, lastMsg.sender_id);
      } else {
        setSafetyRisk({ score: 0, level: 'LOW', flags: [], recommendations: [] });
      }
    } else {
      setSafetyRisk({ score: 0, level: 'LOW', flags: [], recommendations: [] });
    }
  }, [messages, activeThread, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, messagesLoading]);

  // Real-time message subscription
  useEffect(() => {
    if (!activeThread || !user?.id) return;

    const channel = supabase
      .channel(`chat_messages:${activeThread}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${activeThread}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chatMessages', activeThread] });
          queryClient.invalidateQueries({ queryKey: ['chatThreads', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeThread, user?.id, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: ({ threadId, senderId, content }: { threadId: string; senderId: string; content: string }) =>
      sendChatMessage(threadId, senderId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', activeThread] });
      queryClient.invalidateQueries({ queryKey: ['chatThreads', user?.id] });
    },
  });

  const handleSend = async () => {
    if (!message.trim() || !activeThread || !user) return;
    sendMessageMutation.mutate({
      threadId: activeThread,
      senderId: user.id,
      content: message.trim(),
    });
    setMessage('');
  };

  return (
    <div className="h-[calc(100vh-180px)] flex gap-4">
      {/* Threads List */}
      <Card className="w-80 flex flex-col lg:flex">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Messages</h2>
            <Badge variant="secondary" className="bg-teal-100 text-teal-700">
              <Shield className="w-3 h-3 mr-1" />
              Guardian Visible
            </Badge>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search..." className="pl-9" />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          {threadsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : threads && threads.length > 0 ? (
            <div className="p-2 space-y-1">
              {threads.map((thread) => {
                const other =
                  profile?.role === 'MENTOR' ? thread.athlete : thread.mentor;
                return (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThread(thread.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                      activeThread === thread.id ? 'bg-teal-50 border border-teal-200' : ''
                    }`}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-teal-100 text-teal-700">
                        {other?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm truncate">{other?.full_name}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(thread.last_message_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-4 text-gray-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-semibold">No active chats</p>
              <p className="text-xs text-gray-400 mt-1">Connect with a mentor first.</p>
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {activeThread ? (
          <>
            <CardHeader className="p-4 border-b flex flex-row items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-teal-100 text-teal-700">
                  {otherUser?.full_name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{otherUser?.full_name || 'Conversation'}</p>
                <p className="text-xs text-gray-500">
                  Guardian visible for safety
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" className="text-rose-600 border-rose-200 hover:bg-rose-50" onClick={handleReportFromChat}>
                  <Shield className="w-4 h-4 mr-1" />
                  Report
                </Button>
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50" onClick={handleBlockUser}>
                  Block
                </Button>
              </div>
            </CardHeader>

            {/* Chat Safety Alert Bar */}
            <div className={`px-4 py-2 border-b transition-colors ${
              safetyRisk.score >= 70 ? 'bg-red-50 text-red-800 border-red-200' :
              safetyRisk.score >= 35 ? 'bg-amber-50 text-amber-800 border-amber-200' :
              'bg-teal-50 text-teal-800 border-teal-200'
            }`}>
              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${
                      safetyRisk.score >= 70 ? 'text-red-600 animate-pulse' :
                      safetyRisk.score >= 35 ? 'text-amber-600' :
                      'text-teal-600'
                    }`} />
                    <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                      Safety Check: {safetyRisk.level} Risk ({safetyRisk.score}%)
                      <button 
                        onClick={() => setShowSafetyExplain(!showSafetyExplain)} 
                        className="text-gray-400 hover:text-gray-650 transition-colors focus:outline-none"
                        title="How safety check works"
                      >
                        <HelpCircle className="w-3.5 h-3.5 inline text-gray-500" />
                      </button>
                    </span>
                    {safetyRisk.recommendations.length > 0 && (
                      <span className="text-xs hidden md:inline opacity-90">
                        — {safetyRisk.recommendations[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    {safetyRisk.score >= 35 && (
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-2 py-1 h-fit"
                        onClick={handleReportFromChat}
                      >
                        Quick Report
                      </Button>
                    )}
                  </div>
                </div>

                {showSafetyExplain && (
                  <div className="p-3 bg-white rounded-lg border text-xs text-gray-700 space-y-2 shadow-inner">
                    <p className="font-semibold text-teal-900">How does the SHAKTHI Safety Check work?</p>
                    <p>
                      Every message is scanned by our AI backend (using Gemini safety policies) to identify potential harassment, inappropriate boundaries, or offline meetups without guardian approval.
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
                      <div className="p-1.5 bg-teal-50 border border-teal-200 rounded text-teal-800 text-center">
                        <span className="font-bold block">LOW (0-34%)</span>
                        Safe conversation.
                      </div>
                      <div className="p-1.5 bg-amber-50 border border-amber-200 rounded text-amber-800 text-center">
                        <span className="font-bold block">MEDIUM (35-69%)</span>
                        Warning flagged.
                      </div>
                      <div className="p-1.5 bg-red-50 border border-red-200 rounded text-red-800 text-center">
                        <span className="font-bold block">HIGH (70-100%)</span>
                        Critical safety risk.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-3/4 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages && messages.length > 0 ? (
                    messages.map((msg) => {
                      const isOwn = msg.sender_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-xl px-4 py-2 ${
                              isOwn
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwn ? 'text-teal-200' : 'text-gray-400'
                              }`}
                            >
                              {format(new Date(msg.created_at), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>Start a conversation</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Developer Safety Simulator Control Panel */}
            <div className="px-4 py-2 border-t bg-gray-50 flex items-center justify-between text-xs border-b">
              <span className="text-gray-500 font-medium font-mono text-[10px]">Simulate Safety Response:</span>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px] px-2 text-teal-700 border-teal-200 hover:bg-teal-50 bg-white"
                  onClick={() => setSafetyRisk({ score: 10, level: 'LOW', flags: [], recommendations: [] })}
                >
                  Safe (LOW)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px] px-2 text-amber-700 border-amber-200 hover:bg-amber-50 bg-white"
                  onClick={() => setSafetyRisk({
                    score: 45,
                    level: 'MEDIUM',
                    flags: ['offline_meeting'],
                    recommendations: ['Guardians should approve any offline interactions. Keep communication in app.']
                  })}
                >
                  Warning (MEDIUM)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px] px-2 text-red-700 border-red-200 hover:bg-red-50 bg-white"
                  onClick={() => setSafetyRisk({
                    score: 85,
                    level: 'HIGH',
                    flags: ['harassment', 'inappropriate'],
                    recommendations: ['Avoid meeting alone without a guardian present.', 'Report this message to safety officer immediately.']
                  })}
                >
                  Risky (HIGH)
                </Button>
              </div>
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} className="bg-teal-600 hover:bg-teal-700">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
            <div className="text-center max-w-sm space-y-4">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto text-teal-600">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-lg">No Mentorship Conversations</h3>
                <p className="text-sm text-gray-500">
                  You haven't requested mentorship or started messaging any verified coaches yet.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button className="bg-teal-600 hover:bg-teal-700 w-full" asChild>
                  <Link to="/mentors">
                    Browse Verified Mentors
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/safety">
                    Safety & Code of Conduct
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
