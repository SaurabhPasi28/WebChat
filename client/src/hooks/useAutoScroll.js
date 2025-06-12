import { useEffect, useRef } from 'react';

export default function useAutoScroll(dependencies = []) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, dependencies);

  return messagesEndRef;
}