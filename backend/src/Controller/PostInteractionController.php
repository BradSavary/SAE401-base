<?php

namespace App\Controller;

use App\Entity\PostInteraction;
use App\Repository\PostInteractionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class PostInteractionController
{
    #[Route('/post/like/{postId}', name: 'post_like', methods: ['POST'])]
    public function like(int $postId, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true); // Décoder le corps JSON
        $userId = $data['user_id'] ?? null; // Récupérer user_id ou null si absent
    
        if (!$userId) {
            return new JsonResponse(['message' => 'User ID is required'], 400);
        }
    
        // Vérifiez si l'utilisateur a déjà liké ce post
        $existingInteraction = $entityManager->getRepository(PostInteraction::class)
            ->findOneBy(['postId' => $postId, 'userId' => $userId, 'type' => 'like']);
    
        if ($existingInteraction) {
            return new JsonResponse(['message' => 'Post already liked'], 400);
        }
    
        $interaction = new PostInteraction();
        $interaction->setPostId($postId);
        $interaction->setUserId($userId);
        $interaction->setType('like');
    
        $entityManager->persist($interaction);
        $entityManager->flush();
    
        return new JsonResponse(['message' => 'Post liked successfully'], 201);
    }

#[Route('/post/unlike/{postId}', name: 'post_unlike', methods: ['DELETE'])]
public function unlike(int $postId, Request $request, EntityManagerInterface $entityManager): JsonResponse
{
    $data = json_decode($request->getContent(), true); // Decode the JSON body
    $userId = $data['user_id'] ?? null; // Retrieve user_id or null if absent

    if (!$userId) {
        return new JsonResponse(['message' => 'User ID is required'], 400);
    }

    // Find the existing interaction
    $interaction = $entityManager->getRepository(PostInteraction::class)
        ->findOneBy(['postId' => $postId, 'userId' => $userId, 'type' => 'like']);

    if (!$interaction) {
        return new JsonResponse(['message' => 'Like not found'], 404);
    }

    $entityManager->remove($interaction);
    $entityManager->flush();

    return new JsonResponse(['message' => 'Post unliked successfully'], 200);
}
}