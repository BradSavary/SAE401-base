<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserBlock;
use App\Entity\Subscription;
use App\Repository\UserBlockRepository;
use App\Repository\SubscriptionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_USER')]
class UserBlockController extends AbstractController
{
    #[Route('/users/block/{id}', name: 'block', methods: ['POST'])]
    public function blockUser(
        User $targetUser,
        EntityManagerInterface $entityManager,
        UserBlockRepository $userBlockRepository,
        SubscriptionRepository $subscriptionRepository
    ): JsonResponse {
        /** @var User $currentUser */
        $currentUser = $this->getUser();

        // Empêcher l'utilisateur de se bloquer lui-même
        if ($currentUser === $targetUser) {
            return new JsonResponse(['error' => 'You cannot block yourself'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Vérifier si l'utilisateur est déjà bloqué
        $existingBlock = $userBlockRepository->findOneBy([
            'blocker' => $currentUser,
            'blocked' => $targetUser,
        ]);

        // Si l'utilisateur est déjà bloqué, le débloquer
        if ($existingBlock) {
            $entityManager->remove($existingBlock);
            $entityManager->flush();
            return new JsonResponse(['message' => 'User unblocked successfully'], JsonResponse::HTTP_OK);
        }

        // Sinon, créer une nouvelle relation de blocage
        $userBlock = new UserBlock();
        $userBlock->setBlocker($currentUser);
        $userBlock->setBlocked($targetUser);
        $entityManager->persist($userBlock);

        // Si l'utilisateur bloqué est abonné à l'utilisateur qui bloque, supprimer l'abonnement
        $subscription = $subscriptionRepository->findOneBy([
            'subscriber' => $targetUser,
            'subscribedTo' => $currentUser,
        ]);

        if ($subscription) {
            $entityManager->remove($subscription);
        }

        // Si l'utilisateur qui bloque est abonné à l'utilisateur bloqué, supprimer l'abonnement
        $reverseSubscription = $subscriptionRepository->findOneBy([
            'subscriber' => $currentUser,
            'subscribedTo' => $targetUser,
        ]);

        if ($reverseSubscription) {
            $entityManager->remove($reverseSubscription);
        }

        $entityManager->flush();

        return new JsonResponse(['message' => 'User blocked successfully'], JsonResponse::HTTP_OK);
    }

    #[Route('/users/unblock/{id}', name: 'unblock', methods: ['POST'])]
    public function unblockUser(
        User $targetUser,
        EntityManagerInterface $entityManager,
        UserBlockRepository $userBlockRepository
    ): JsonResponse {
        /** @var User $currentUser */
        $currentUser = $this->getUser();

        // Vérifier si l'utilisateur est effectivement bloqué
        $existingBlock = $userBlockRepository->findOneBy([
            'blocker' => $currentUser,
            'blocked' => $targetUser,
        ]);

        if (!$existingBlock) {
            return new JsonResponse(['error' => 'User is not blocked'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Supprimer la relation de blocage
        $entityManager->remove($existingBlock);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User unblocked successfully'], JsonResponse::HTTP_OK);
    }

    #[Route('/users/blocks', name: 'list_blocks', methods: ['GET'])]
    public function getBlockedUsers(UserBlockRepository $userBlockRepository): JsonResponse
    {
        /** @var User $currentUser */
        $currentUser = $this->getUser();

        $blockedUsers = $userBlockRepository->findBlockedUsers($currentUser);
        
        $formattedUsers = [];
        foreach ($blockedUsers as $block) {
            $blockedUser = $block->getBlocked();
            $formattedUsers[] = [
                'id' => $blockedUser->getId(),
                'username' => $blockedUser->getUsername(),
                'blocked_at' => $block->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }

        return new JsonResponse(['blocked_users' => $formattedUsers], JsonResponse::HTTP_OK);
    }

    #[Route('/users/is-blocked/{id}', name: 'check_blocked', methods: ['GET'])]
    public function isUserBlocked(User $targetUser, UserBlockRepository $userBlockRepository): JsonResponse
    {
        /** @var User $currentUser */
        $currentUser = $this->getUser();

        $isBlocked = $userBlockRepository->isBlocked($currentUser, $targetUser);
        $isBlockedBy = $userBlockRepository->isBlocked($targetUser, $currentUser);

        return new JsonResponse([
            'is_blocked' => $isBlocked,
            'is_blocked_by' => $isBlockedBy,
        ], JsonResponse::HTTP_OK);
    }
} 