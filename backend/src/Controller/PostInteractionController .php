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
        $userId = $request->get('user_id'); // Assurez-vous que l'ID utilisateur est transmis dans la requête

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
        $userId = $request->get('userId'); // Assurez-vous que l'ID utilisateur est transmis dans la requête

        // Trouvez l'interaction existante
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