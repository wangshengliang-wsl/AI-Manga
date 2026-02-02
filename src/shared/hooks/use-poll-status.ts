'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface PollOptions<T> {
  interval?: number;
  stopCondition?: (data: T) => boolean;
  immediate?: boolean;
  onError?: (error: unknown) => void;
}

export function usePollStatus<T>(
  fetcher: () => Promise<T>,
  {
    interval = 3000,
    stopCondition,
    immediate = true,
    onError,
  }: PollOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isPolling, setIsPolling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchRef = useRef(fetcher);

  useEffect(() => {
    fetchRef.current = fetcher;
  }, [fetcher]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const pollOnce = useCallback(async () => {
    try {
      const result = await fetchRef.current();
      setData(result);
      setError(null);
      if (stopCondition && stopCondition(result)) {
        stop();
      }
      return result;
    } catch (err) {
      setError(err);
      onError?.(err);
      return null;
    }
  }, [onError, stop, stopCondition]);

  const start = useCallback(() => {
    if (timerRef.current) return;
    setIsPolling(true);
    if (immediate) {
      pollOnce();
    }
    timerRef.current = setInterval(pollOnce, interval);
  }, [immediate, interval, pollOnce]);

  useEffect(() => () => stop(), [stop]);

  return {
    data,
    error,
    isPolling,
    start,
    stop,
    pollOnce,
  };
}
