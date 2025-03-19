// fake a cache so we don't slow down stuff we've already seen
let fakeCache: { [key: string]: boolean } = {};

export async function fakeNetwork(key?: string): Promise<void> {
    if (!key) {
        fakeCache = {};
    }

    if (key && fakeCache[key]) {
        return;
    }

    if (key) {
        fakeCache[key] = true;
    }

    return new Promise(res => {
        setTimeout(res, Math.random() * 8000);
    });
}

import { cva } from 'class-variance-authority';

export const iconStyles = cva('', {
  variants: {
    size: {
      small: 'h-4 w-4',
      medium: 'h-8 w-8',
      large: 'h-12 w-12',
      xlarge: 'h-16 w-16',
    },
  },
  defaultVariants: {
    size: 'medium',
  },
});

export function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
      return `${interval} years`;
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
      return `${interval} months`;
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
      return `${interval} days`;
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
      return `${interval} hours`;
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
      return `${interval} mins`;
  }
  return `${Math.floor(seconds)} s`;
}