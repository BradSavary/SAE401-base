<?php

namespace App\Service;

use App\Dto\Payload\CreatePostPayload;
use App\Entity\Post;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UserRepository;

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
        $post->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($post);
        $this->entityManager->flush();
    }
    
}