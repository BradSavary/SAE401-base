async function fetchFeedPosts() {
    try {
        const response = await fetch('http://localhost:8080/posts', {
            headers: {
                'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // Replace with your actual token
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized request. Please check your authentication.');
            }
            throw new Error(`Error fetching posts: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
}

export { fetchFeedPosts };