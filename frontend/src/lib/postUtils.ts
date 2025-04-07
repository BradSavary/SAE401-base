// filepath: /home/bradsavary/SAE401-base/frontend/src/utils/postUtils.ts
export const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

interface PostData {
    isBlocked: boolean;
}

export const filterBlockedPosts = (posts: PostData[]): PostData[] => {
    return posts.filter(post => !post.isBlocked);
};