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
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

export default function ChatPage() {
  const { user, profile } = useAuth();
  const { threadId } = useParams();
  const [message, setMessage] = useState('');
  const [activeThread, setActiveThread] = useState<string | null>(threadId || null);

  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: threads, isLoading: threadsLoading } = useQuery({
    queryKey: ['chatThreads', user?.id],
    queryFn: () => getChatThreads(user!.id),
    enabled: !!user,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['chatMessages', activeThread],
    queryFn: () => getChatMessages(activeThread!),
    enabled: !!activeThread,
  });

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
                  T
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Conversation</p>
                <p className="text-xs text-gray-500">
                  Guardian visible for safety
                </p>
              </div>
              <div className="ml-auto">
                <Button variant="outline" size="sm" className="text-rose-600">
                  <Shield className="w-4 h-4 mr-1" />
                  Report
                </Button>
              </div>
            </CardHeader>

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
