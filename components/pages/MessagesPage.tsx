// components/pages/MessagesPage.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Profile, Message, supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface MessagesPageProps {
  user: User | null;
  profile: Profile | null;
}

export default function MessagesPage({ user, profile }: MessagesPageProps) {
  const [conversations, setConversations] = useState<Profile[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const fetchConversations = useCallback(async (): Promise<Profile[]> => {
    if (!user) return [];
    setLoadingConvos(true);
    try {
      const { data, error } = await supabase.rpc('get_conversations', { current_user_id: user.id });
      if (error) throw error;
      const validConversations = data ? data.filter(Boolean) : [];
      setConversations(validConversations);
      return validConversations;
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      toast.error('Failed to load conversations.');
      return [];
    } finally {
      setLoadingConvos(false);
    }
  }, [user]);

  const fetchMessages = useCallback(async (recipientId: string) => {
    if (!user) return;
    setLoadingMessages(true);
    try {
        // Correctly call the get_messages RPC function
        const { data, error } = await supabase.rpc('get_messages', {
            user1_id: user.id,
            user2_id: recipientId
        });
        if(error) throw error;
        setMessages(data || []);
    } catch(error: any) {
        console.error("Error fetching messages:", error.message);
        toast.error('Failed to load messages.');
    } finally {
        setLoadingMessages(false);
    }
  }, [user]);

  const handleSelectConvo = (convoProfile: Profile) => {
    if (selectedConvo?.id === convoProfile.id) return;
    router.push(`/?page=messages&recipient=${convoProfile.id}`, { scroll: false });
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedConvo || sendingMessage) return;
    const content = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);
    try {
        const optimisticMessage: Message = { id: `temp-${Date.now()}`, sender_id: user.id, recipient_id: selectedConvo.id, content: content, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, optimisticMessage]);

        const { error } = await supabase.from('messages').insert({ sender_id: user.id, recipient_id: selectedConvo.id, content: content });
        if(error) {
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
            toast.error("Failed to send message.");
            throw error;
        }
    } catch (error: any) {
        console.error("Error sending message:", error);
    } finally {
        setSendingMessage(false);
    }
  };

  // This effect handles selecting a conversation based on the URL
  useEffect(() => {
    const recipientId = searchParams.get('recipient');
    if (recipientId) {
      if(selectedConvo?.id !== recipientId) {
        const convo = conversations.find(c => c.id === recipientId);
        if (convo) {
          setSelectedConvo(convo);
          fetchMessages(recipientId);
        }
      }
    } else if (selectedConvo) {
        setSelectedConvo(null);
        setMessages([]);
    }
  }, [searchParams, conversations, selectedConvo?.id, fetchMessages]);


  // This effect runs once to initialize the page
  useEffect(() => {
    const initialize = async () => {
        const convos = await fetchConversations();
        const recipientId = searchParams.get('recipient');
        // If a recipient is in the URL but not in our current conversation list
        if (recipientId && !convos.some((c: Profile) => c.id === recipientId)) {
            const { data: newProfile, error } = await supabase.from('profiles').select('*').eq('id', recipientId).single();
            if (error) {
                toast.error("User not found.");
                router.push('/?page=messages');
            } else if (newProfile) {
                // This logic prevents adding a duplicate if it's already there
                setConversations(prev => {
                    if (prev.some(p => p.id === newProfile.id)) return prev;
                    return [newProfile, ...prev];
                });
                setSelectedConvo(newProfile);
                fetchMessages(recipientId);
            }
        }
    };
    
    initialize();
  }, [fetchConversations, searchParams, router]);

  // This effect listens for real-time messages
  useEffect(() => {
    if(!user?.id) return;
    const messageChannel = supabase.channel(`messages-for-${user.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${user.id}` }, (payload) => {
            const newMessage = payload.new as Message;
            if(selectedConvo && newMessage.sender_id === selectedConvo.id) {
                setMessages(prev => [...prev, newMessage]);
            } else {
                toast.info(`You have a new message!`);
                fetchConversations();
            }
        })
        .subscribe();
    
    return () => {
        supabase.removeChannel(messageChannel);
    };
  }, [user?.id, selectedConvo, fetchConversations]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="h-[calc(100vh-120px)] flex overflow-hidden">
        <div className={`w-full md:w-1/3 border-r flex flex-col ${selectedConvo ? 'hidden md:flex' : 'flex'}`}>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1">
            {loadingConvos ? <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div> : conversations.length > 0 ? conversations.map(convo => (
              <div key={convo.id} onClick={() => handleSelectConvo(convo)} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${selectedConvo?.id === convo.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                <Avatar><AvatarImage src={convo.avatar_url} /><AvatarFallback>{convo.username?.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                <span className="font-medium">{convo.username}</span>
              </div>
            )) : <p className="text-gray-500 text-center mt-8">No conversations yet.</p>}
          </CardContent>
        </div>
        <div className={`w-full md:w-2/3 flex flex-col ${selectedConvo ? 'flex' : 'hidden md:flex'}`}>
          {selectedConvo ? (
            <>
              <div className="border-b p-3 flex items-center space-x-3 flex-shrink-0">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push('/?page=messages')}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar><AvatarImage src={selectedConvo.avatar_url} /><AvatarFallback>{selectedConvo.username?.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                <span className="font-semibold">{selectedConvo.username}</span>
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {loadingMessages ? <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div> : messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg break-words ${msg.sender_id === user?.id ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t flex space-x-2 flex-shrink-0">
                <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." onKeyDown={e => e.key === 'Enter' && handleSendMessage()}/>
                <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sendingMessage}>
                    {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex-col items-center justify-center text-center text-gray-500 hidden md:flex">
              <MessageSquare className="w-16 h-16 text-gray-300 mb-4"/>
              <h3 className="text-xl font-semibold">Select a conversation</h3>
              <p>Choose from your existing conversations or start a new one by messaging a user from their profile.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
