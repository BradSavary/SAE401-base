<?php

namespace App\Controller;

use App\Entity\CommentInteraction;
use App\Entity\Comment;
use App\Entity\User;
use App\Repository\CommentInteractionRepository;
use App\Repository\UserBlockRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class CommentInteractionController extends AbstractController
{
    #[Route('/comment/{commentId}/interact', name: 'comment_interact', methods: ['POST'])]
    #[IsGranted("ROLE_USER")]
    public function interact(
        int $commentId,
        Request $request,
        EntityManagerInterface $entityManager,
        CommentInteractionRepository $interactionRepository,
        UserBlockRepository $userBlockRepository
    ): JsonResponse {
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return new JsonResponse(['error' => 'User not authenticated'], 401);
        }

        $comment = $entityManager->getRepository(Comment::class)->find($commentId);
        if (!$comment) {
            return new JsonResponse(['error' => 'Comment not found'], 404);
        }

        // Vérifier si l'utilisateur est bloqué par l'auteur du commentaire
        $commentAuthor = $comment->getUser();
        if ($userBlockRepository->isBlocked($commentAuthor, $currentUser)) {
            return new JsonResponse(['error' => 'You cannot interact with this comment'], 403);
        }

        // Vérifier si l'utilisateur a bloqué l'auteur du commentaire
        if ($userBlockRepository->isBlocked($currentUser, $commentAuthor)) {
            return new JsonResponse(['error' => 'You have blocked the author of this comment'], 403);
        }

        // Vérifier si l'interaction existe déjà
        $existingInteraction = $interactionRepository->findInteractionByUserAndComment(
            $currentUser->getId(),
            $commentId
        );

        if ($existingInteraction) {
            // Si l'interaction existe, on la supprime (unlike)
            $entityManager->remove($existingInteraction);
            $entityManager->flush();

            // Récupérer le nouveau nombre de likes
            $likesCount = $interactionRepository->countLikesByComment($commentId);
            
            return new JsonResponse([
                'message' => 'Like removed successfully',
                'likes' => $likesCount,
                'user_liked' => false
            ]);
        }

        // Créer une nouvelle interaction (like)
        // Créer une nouvelle interaction (like)
        $interaction = new CommentInteraction();
        $interaction->setComment($comment);
        $interaction->setUser($currentUser);
        $interaction->setType('like');

        $entityManager->persist($interaction);
        $entityManager->flush();

        // Récupérer le nouveau nombre de likes
        $likesCount = $interactionRepository->countLikesByComment($commentId);

        return new JsonResponse([
            'message' => 'Comment liked successfully',
            'likes' => $likesCount,
            'user_liked' => true
        ], 201);
    }

    #[Route('/comment/{commentId}/interactions', name: 'comment_interactions', methods: ['GET'])]
    public function getInteractions(
        int $commentId,
        CommentInteractionRepository $interactionRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $comment = $entityManager->getRepository(Comment::class)->find($commentId);
        if (!$comment) {
            return new JsonResponse(['error' => 'Comment not found'], 404);
        }

        $likes = $interactionRepository->countLikesByComment($commentId);

        $currentUser = $this->getUser();
        $userLiked = false;

        if ($currentUser) {
            $existingInteraction = $interactionRepository->findInteractionByUserAndComment(
                $currentUser->getId(),
                $commentId
            );
            $userLiked = $existingInteraction !== null;
        }

        return new JsonResponse([
            'likes' => $likes,
            'user_liked' => $userLiked
        ]);
    }
} 