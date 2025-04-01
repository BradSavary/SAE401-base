<?php

namespace App\Controller;

use App\Entity\PostInteraction;
use App\Repository\PostInteractionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Post;

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

    // Récupérer l'utilisateur à partir de l'ID
    $user = $entityManager->getRepository(\App\Entity\User::class)->find($userId);
    if (!$user) {
        return new JsonResponse(['message' => 'User not found'], 404);
    }

    // Vérifiez si le post existe
    $post = $entityManager->getRepository(Post::class)->find($postId);
    if (!$post) {
        return new JsonResponse(['message' => 'Post not found'], 404);
    }

    // Vérifiez si l'utilisateur a déjà liké ce post
    $existingInteraction = $entityManager->getRepository(PostInteraction::class)
        ->findOneBy(['post' => $post, 'user' => $user, 'type' => 'like']);

    if ($existingInteraction) {
        return new JsonResponse(['message' => 'Post already liked'], 400);
    }

    // Créer une nouvelle interaction
    $interaction = new PostInteraction();
    $interaction->setPost($post);
    $interaction->setUser($user); // Utiliser l'objet User ici
    $interaction->setType('like');

    $entityManager->persist($interaction);
    $entityManager->flush();

    return new JsonResponse(['message' => 'Post liked successfully'], 201);
}

#[Route('/post/like/{postId}', name: 'post_unlike', methods: ['DELETE'])]
public function unlike(int $postId, Request $request, EntityManagerInterface $entityManager): JsonResponse
{
    $data = json_decode($request->getContent(), true); // Decode the JSON body
    $userId = $data['user_id'] ?? null; // Retrieve user_id or null if absent

    if (!$userId) {
        return new JsonResponse(['message' => 'User ID is required'], 400);
    }

    // Récupérer l'utilisateur à partir de l'ID
    $user = $entityManager->getRepository(\App\Entity\User::class)->find($userId);
    if (!$user) {
        return new JsonResponse(['message' => 'User not found'], 404);
    }

    // Vérifiez si le post existe
    $post = $entityManager->getRepository(Post::class)->find($postId);
    if (!$post) {
        return new JsonResponse(['message' => 'Post not found'], 404);
    }

    // Trouver l'interaction existante
    $interaction = $entityManager->getRepository(PostInteraction::class)
        ->findOneBy(['post' => $post, 'user' => $user, 'type' => 'like']);

    if (!$interaction) {
        return new JsonResponse(['message' => 'Like not found'], 404);
    }

    $entityManager->remove($interaction);
    $entityManager->flush();

    return new JsonResponse(['message' => 'Post unliked successfully'], 200);
}

    #[Route('/post/like/{postId}', name: 'post_get_likes', methods: ['GET'])]
    public function getLikes(int $postId, Request $request, PostInteractionRepository $interactionRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $post = $entityManager->getRepository(Post::class)->find($postId);
        if (!$post) {
            return new JsonResponse(['message' => 'Post not found'], 404);
        }

        $likes = $interactionRepository->count(['post' => $postId, 'type' => 'like']);

        $userId = $request->query->get('user_id'); // Get user_id from query parameters
        $userLiked = false;

        if ($userId) {
            $user = $entityManager->getRepository(\App\Entity\User::class)->find($userId);
            if ($user) {
                $existingInteraction = $interactionRepository->findOneBy([
                    'post' => $post,
                    'user' => $user,
                    'type' => 'like'
                ]);
                $userLiked = $existingInteraction !== null;
            }
        }

        return new JsonResponse(['likes' => $likes, 'user_liked' => $userLiked]);
    }
    
}