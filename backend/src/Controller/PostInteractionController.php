<?php

namespace App\Controller;

use App\Entity\PostInteraction;
use App\Repository\PostInteractionRepository;
use App\Repository\UserBlockRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Post;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class PostInteractionController extends AbstractController
{
    #[Route('/post/like/{postId}', name: 'post_like', methods: ['POST'])]
    #[IsGranted("ROLE_USER")]
    public function like(
        int $postId, 
        Request $request, 
        EntityManagerInterface $entityManager,
        UserBlockRepository $userBlockRepository
    ): JsonResponse {
        // On utilise directement l'utilisateur connecté
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return new JsonResponse(['message' => 'User not authenticated'], 401);
        }

        // Vérifiez si le post existe
        $post = $entityManager->getRepository(Post::class)->find($postId);
        if (!$post) {
            return new JsonResponse(['message' => 'Post not found'], 404);
        }

        // Vérifiez si l'utilisateur a déjà liké ce post
        $existingInteraction = $entityManager->getRepository(PostInteraction::class)
            ->findOneBy(['post' => $post, 'user' => $currentUser, 'type' => 'like']);

        if ($existingInteraction) {
            return new JsonResponse(['message' => 'Post already liked'], 400);
        }

        // Vérifier si l'utilisateur est bloqué par l'auteur du post
        $postAuthor = $post->getUser();
        if ($userBlockRepository->isBlocked($postAuthor, $currentUser)) {
            return new JsonResponse(['message' => 'You cannot interact with this post'], 403);
        }

        // Vérifier si l'utilisateur a bloqué l'auteur du post
        if ($userBlockRepository->isBlocked($currentUser, $postAuthor)) {
            return new JsonResponse(['message' => 'You have blocked the author of this post'], 403);
        }

        // Créer une nouvelle interaction
        $interaction = new PostInteraction();
        $interaction->setPost($post);
        $interaction->setUser($currentUser);
        $interaction->setType('like');

        $entityManager->persist($interaction);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Post liked successfully'], 201);
    }

    #[Route('/post/like/{postId}', name: 'post_unlike', methods: ['DELETE'])]
    #[IsGranted("ROLE_USER")]
    public function unlike(
        int $postId, 
        Request $request, 
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // On utilise directement l'utilisateur connecté
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return new JsonResponse(['message' => 'User not authenticated'], 401);
        }

        // Vérifiez si le post existe
        $post = $entityManager->getRepository(Post::class)->find($postId);
        if (!$post) {
            return new JsonResponse(['message' => 'Post not found'], 404);
        }

        // Trouver l'interaction existante
        $interaction = $entityManager->getRepository(PostInteraction::class)
            ->findOneBy(['post' => $post, 'user' => $currentUser, 'type' => 'like']);

        if (!$interaction) {
            return new JsonResponse(['message' => 'Like not found'], 404);
        }

        $entityManager->remove($interaction);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Post unliked successfully'], 200);
    }

    #[Route('/post/like/{postId}', name: 'post_get_likes', methods: ['GET'])]
    public function getLikes(
        int $postId, 
        Request $request, 
        PostInteractionRepository $interactionRepository, 
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $post = $entityManager->getRepository(Post::class)->find($postId);
        if (!$post) {
            return new JsonResponse(['message' => 'Post not found'], 404);
        }

        $likes = $interactionRepository->count(['post' => $postId, 'type' => 'like']);

        // Vérifier si l'utilisateur est connecté
        $currentUser = $this->getUser();
        $userLiked = false;

        if ($currentUser) {
            $existingInteraction = $interactionRepository->findOneBy([
                'post' => $post,
                'user' => $currentUser,
                'type' => 'like'
            ]);
            $userLiked = $existingInteraction !== null;
        }

        return new JsonResponse(['likes' => $likes, 'user_liked' => $userLiked]);
    }
}