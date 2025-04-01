<?php

namespace App\Service;

use App\Dto\Payload\CreatePostPayload;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UserRepository;
use App\Entity\Post;
use App\Entity\User;

class PostService
{
    private EntityManagerInterface $entityManager;
    private UserRepository $userRepository;

    public function __construct(EntityManagerInterface $entityManager, UserRepository $userRepository)
    {
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
    }

    public function create(CreatePostPayload $payload): void
{
    $user = $this->userRepository->find($payload->getUserId());
    if (!$user) {
        throw new \Exception('User not found');
    }

    $post = new Post();
    $post->setContent($payload->getContent());
    $post->setUser($user);
    $post->setAuthor($user); // Définir l'auteur ici
    $post->setCreatedAt(new \DateTimeImmutable());

    $this->entityManager->persist($post);
    $this->entityManager->flush();
}
    
public function formatPostDetails(Post $post, ?User $currentUser, string $baseUrl, string $uploadDir): array
{
    $user = $post->getUser();
    $avatarUrl = $user->getAvatar() ? $baseUrl . '/' . $uploadDir . '/' . $user->getAvatar() : null;
    $isLiked = $currentUser ? $post->isLikedByUser($currentUser) : false;

    $createdAt = $post->getCreatedAt();
    $postDetails = [
        'id' => $post->getId(),
        'content' => $post->getContent(),
        'created_at' => [
            'date' => $createdAt->format('Y-m-d H:i:s'),
            'timezone_type' => $createdAt->getTimezone()->getLocation()['timezone_type'] ?? 3,
            'timezone' => $createdAt->getTimezone()->getName(),
        ],
        'username' => $user->getUsername(),
        'avatar' => $avatarUrl,
        'user_id' => $user->getId(),
        'likes' => $post->getLikesCount(),
        'userLiked' => $isLiked,
        'isBlocked' => $user->getIsBlocked(),
    ];

    if ($user->getIsBlocked()) {
        $postDetails['content'] = 'This account has been blocked for violating the terms of use.';
        $postDetails['likes'] = 0;
        $postDetails['userLiked'] = false;
    }

    return $postDetails;
}
public function paginatePosts(array $posts, int $page, int $limit): array
{
    $offset = ($page - 1) * $limit;
    $paginatedPosts = array_slice($posts, $offset, $limit);

    $totalPostsCount = count($posts);
    $previousPage = $page > 1 ? $page - 1 : null;
    $nextPage = ($offset + $limit) < $totalPostsCount ? $page + 1 : null;

    return [
        'posts' => $paginatedPosts,
        'previous_page' => $previousPage,
        'next_page' => $nextPage,
    ];
}


}