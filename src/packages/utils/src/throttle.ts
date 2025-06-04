import { useCallback, useState } from 'react';

// Custom hook for throttling a function
export function useThrottledFn<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T {
  const [throttleTimeout, setThrottleTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      if (!throttleTimeout) {
        // Call the original function with the arguments
        fn(...args);

        // Set the throttle timeout to prevent rapid clicks
        setThrottleTimeout(
          setTimeout(() => {
            setThrottleTimeout(null);
          }, delay)
        );
      }
    },
    [fn, throttleTimeout, delay]
  );

  return throttledFn as T;
}
