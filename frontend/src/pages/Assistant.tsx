
import React, { useState } from 'react';
import PageTitle from '../components/shared/PageTitle';
import Chat from '../components/assistant/Chat';
import AssistantActions from '../components/assistant/AssistantActions';
import { mockChatMessages } from '../data/mockData';
import { ChatMessage } from '../types';
import { useToast } from '../hooks/use-toast';

const Assistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([...mockChatMessages]);
  const { toast } = useToast();
  
  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate assistant response after a short delay
    setTimeout(() => {
      let responseContent = "I'm sorry, I don't understand that request. How can I help you?";
      
      // Simple keyword matching for demo purposes
      if (content.toLowerCase().includes('trip') || content.toLowerCase().includes('travel')) {
        responseContent = "Here's your Istanbul trip summary:";
        
        // Add a trip card after response
        setTimeout(() => {
          const tripCardMessage: ChatMessage = {
            id: Date.now().toString() + '-card',
            content: `
              <div class="bg-white p-3 rounded-lg border border-gray-200">
                <h4 class="font-medium">Istanbul Trip</h4>
                <p class="text-sm text-gray-600">May 15-20, 2025</p>
                <div class="mt-2">
                  <div class="flex items-center text-sm">
                    <span class="mr-2">🏨</span> Shangri-La Bosphorus
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="mr-2">✈️</span> Turkish Airlines TK1984
                  </div>
                </div>
              </div>
            `,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          setMessages(prev => [...prev, tripCardMessage]);
        }, 500);
      } else if (content.toLowerCase().includes('remind') || content.toLowerCase().includes('reminder')) {
        responseContent = "I've added a reminder for you. Is there anything else you need?";
      } else if (content.toLowerCase().includes('event') || content.toLowerCase().includes('schedule')) {
        responseContent = "Would you like me to schedule a new event? Please provide the details.";
      }
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        content: responseContent,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };
  
  const handleShowTrip = () => {
    const tripMessage: ChatMessage = {
      id: Date.now().toString(),
      content: "Can you show me my Istanbul trip details?",
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, tripMessage]);
    handleSendMessage("Can you show me my Istanbul trip details?");
  };
  
  const handleAddReminder = () => {
    toast({
      title: 'Add Reminder',
      description: 'Redirecting to add reminder form...',
    });
  };
  
  const handleScheduleEvent = () => {
    toast({
      title: 'Schedule Event',
      description: 'Redirecting to event scheduling...',
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle title="Virtual Assistant" />
      
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
        <Chat messages={messages} onSendMessage={handleSendMessage} />
        <AssistantActions 
          onShowTrip={handleShowTrip}
          onAddReminder={handleAddReminder}
          onScheduleEvent={handleScheduleEvent}
        />
      </div>
    </div>
  );
};

export default Assistant;
