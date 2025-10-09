// /src/components/chat-client.tsx
"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { Send, MessageSquare, Loader2, Users, HardHat, Briefcase, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { nanoid } from 'nanoid';

import { useAuth } from '@/hooks/use-auth';
import type { ChatRoom, ChatMessage, ChatCategory, UserProfile, Organization } from '@/lib/types';
import { getChatRoomsForUser, sendMessage, listenToMessages, initializeChatRoomsForOrg } from '@/services/chat-service';
import { getUsers } from '@/services/user-service';
import { chatAssistant } from '@/ai/flows/chat-assistant-flow';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getOrganizations } from '@/services/organization-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const categoryIcons: Record<ChatCategory, React.ElementType> = {
  Soporte: HardHat,
  Admin: Users,
  Ventas: Briefcase,
  Dudas: HelpCircle,
};

export function ChatClient() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const fetchAndInitializeRooms = async (profile: UserProfile) => {
    setLoadingRooms(true);
    try {
      let userRooms = await getChatRoomsForUser(profile);
      
      if (userRooms.length === 0 && profile.role === 'SuperAdmin') {
          const allOrgs = await getOrganizations();
          if (allOrgs.length > 0) {
              const firstOrg = allOrgs[0];
              const orgUsers = await getUsers();
              const orgMemberIds = orgUsers.filter(u => u.organizationId === firstOrg.id).map(u => u.uid);
              await initializeChatRoomsForOrg(firstOrg.id, firstOrg.name, [...orgMemberIds, profile.uid]);
              userRooms = await getChatRoomsForUser(profile);
          }
      } else if (userRooms.length === 0 && profile.organizationId) {
        const orgUsers = await getUsers();
        const orgMemberIds = orgUsers.filter(u => u.organizationId === profile.organizationId).map(u => u.uid);
        const orgDoc = await getDoc(doc(db, 'organizations', profile.organizationId));
        const orgName = orgDoc.exists() ? (orgDoc.data() as Organization).name : `Org de ${profile.name}`;
        await initializeChatRoomsForOrg(profile.organizationId, orgName, orgMemberIds);
        userRooms = await getChatRoomsForUser(profile);
      }

      setRooms(userRooms);
      if (userRooms.length > 0 && !selectedRoom) {
        setSelectedRoom(userRooms[0]);
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las salas de chat.', variant: 'destructive' });
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (userProfile) {
      fetchAndInitializeRooms(userProfile);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);


  useEffect(() => {
    if (selectedRoom) {
      setLoadingMessages(true);
      const unsubscribe = listenToMessages(selectedRoom.id, (newMessages) => {
        setMessages(newMessages);
        setLoadingMessages(false);
        setTimeout(() => {
            if (scrollAreaRef.current) {
               const viewport = scrollAreaRef.current.querySelector('div');
               if (viewport) viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
      });

      return () => unsubscribe();
    }
  }, [selectedRoom]);

  const triggerAssistant = async (roomId: string, roomCategory: ChatCategory, currentChatHistory: ChatMessage[], lastMessage: string) => {
    setIsAiThinking(true);
    try {
        const historyForAI = currentChatHistory.map(m => ({
            senderName: m.senderName,
            text: m.text
        }));

        const assistantResponse = await chatAssistant({
            chatHistory: historyForAI,
            currentMessage: lastMessage,
            roomCategory: roomCategory,
        });

        if (assistantResponse && assistantResponse.response) {
            const assistantMessage = {
                senderId: 'ai_assistant',
                senderName: 'Asistente Virtual',
                senderAvatarUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/robot-assistant-6534661-5383525.png',
                text: assistantResponse.response,
            };
            await sendMessage(roomId, assistantMessage);
        }
    } catch (error) {
        console.error("AI Assistant failed:", error);
    } finally {
        setIsAiThinking(false);
    }
  }


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userProfile || !selectedRoom) return;

    const messageText = newMessage;
    const currentRoomId = selectedRoom.id;
    const currentRoomCategory = selectedRoom.category;

    const messageData = {
      senderId: userProfile.uid,
      senderName: userProfile.name,
      senderAvatarUrl: userProfile.avatarUrl,
      text: messageText,
    };

    setNewMessage('');
    try {
      await sendMessage(currentRoomId, messageData);

      // Don't trigger assistant for direct support chats with guests
      if (selectedRoom.type !== 'support') {
        // We pass the current messages + the new one to the assistant
        triggerAssistant(currentRoomId, currentRoomCategory, [...messages, { ...messageData, id: nanoid(), roomId: currentRoomId, timestamp: new Date() }], messageText);
      }

    } catch {
      toast({ title: 'Error', description: 'No se pudo enviar el mensaje.', variant: 'destructive' });
      setNewMessage(messageText);
    }
  };

  const groupedRooms = useMemo(() => {
    return rooms.reduce((acc, room) => {
      const category = room.category || 'Dudas';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(room);
      return acc;
    }, {} as Record<ChatCategory, ChatRoom[]>);
  }, [rooms]);

  return (
    <div className="flex h-full">
      {/* Rooms List */}
      <div className="w-1/3 border-r flex flex-col">
        <ScrollArea className="flex-1">
          {loadingRooms ? <div className="p-4 text-center text-sm text-muted-foreground">Cargando salas...</div> : (
            Object.entries(groupedRooms).map(([category, roomsInCategory]) => {
              const CategoryIcon = categoryIcons[category as ChatCategory] || HelpCircle;
              return (
              <div key={category}>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground p-3 flex items-center gap-2"><CategoryIcon className="h-4 w-4"/> {category}</h3>
                {roomsInCategory.map(room => {
                    const roomNameParts = room.name ? room.name.split(' - ') : ['Sala sin nombre'];
                    const mainName = roomNameParts[0];
                    const orgName = roomNameParts[1];

                    return (
                      <div
                        key={room.id}
                        className={cn(
                          "p-3 border-b cursor-pointer hover:bg-muted/50",
                          selectedRoom?.id === room.id && "bg-muted"
                        )}
                        onClick={() => setSelectedRoom(room)}
                      >
                        <div>
                          <p className="font-semibold text-sm truncate">{mainName}</p>
                          {userProfile?.role === 'SuperAdmin' && orgName && <p className="text-xs text-muted-foreground truncate">{orgName}</p>}
                          <p className="text-xs text-muted-foreground truncate">{room.lastMessage?.text || 'Sin mensajes aún.'}</p>
                        </div>
                      </div>
                    );
                })}
              </div>
            )})
          )}
        </ScrollArea>
      </div>

      {/* Messages View */}
      <div className="w-2/3 flex flex-col">
        {selectedRoom ? (
          <>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                {loadingMessages ? <Loader2 className="mx-auto my-auto h-6 w-6 animate-spin text-muted-foreground"/> : (
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div
                            key={msg.id}
                            className={cn(
                                "flex items-start gap-3",
                                msg.senderId === user?.uid ? "justify-end" : "justify-start"
                            )}
                            >
                            {msg.senderId !== user?.uid && (
                                <Avatar className="h-8 w-8">
                                <AvatarImage src={msg.senderAvatarUrl} />
                                <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={cn(
                                "max-w-xs md:max-w-md rounded-lg p-3 text-sm",
                                msg.senderId === user?.uid
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted",
                                msg.senderId === 'ai_assistant' && 'bg-purple-50 text-purple-900 border border-purple-200'
                                )}
                            >
                                <p className="font-semibold">{msg.senderName}</p>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                <p className="text-xs opacity-70 mt-1">
                                    {msg.timestamp ? format(msg.timestamp.toDate(), 'p', { locale: es }) : ''}
                                </p>
                            </div>
                             {msg.senderId === user?.uid && (
                                <Avatar className="h-8 w-8">
                                <AvatarImage src={msg.senderAvatarUrl} />
                                <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                            </div>
                        ))}
                         {isAiThinking && (
                            <div className="flex items-start gap-3 justify-start">
                                <Avatar className="h-8 w-8">
                                <AvatarImage src="https://cdn3d.iconscout.com/3d/premium/thumb/robot-assistant-6534661-5383525.png" />
                                <AvatarFallback>A</AvatarFallback>
                                </Avatar>
                                <div className="max-w-xs md:max-w-md rounded-lg p-3 text-sm bg-purple-50 text-purple-900 border border-purple-200">
                                    <p className="font-semibold">Asistente Virtual</p>
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                        <span>Pensando...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escriba un mensaje..."
                  autoComplete="off"
                  disabled={isAiThinking}
                />
                <Button type="submit" size="icon" disabled={isAiThinking}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Seleccione una sala de chat</p>
            <p className="text-sm">o comience una nueva conversación.</p>
          </div>
        )}
      </div>
    </div>
  );
}
