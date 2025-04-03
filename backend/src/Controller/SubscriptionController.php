<?php

namespace App\Controller;

use App\Entity\Subscription;
use App\Entity\User;
use App\Repository\PostRepository;
use App\Repository\SubscriptionRepository;
use App\Repository\UserRepository;
use App\Entity\Post;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use \DateTime;
use Symfony\Component\HttpFoundation\Request;
use App\Service\PostService;
use App\Repository\UserBlockRepository;

class SubscriptionController extends AbstractController
{
    private PostService $PostService;

    public function __construct(PostService $PostService)
    {
        $this->PostService = $PostService;
    }

    #[Route('/subscriptions/posts/{id}', name: 'subscriptions_posts', methods: ['GET'])]
    public function getSubscriptionsPosts(
        int $id,
        SubscriptionRepository $subscriptionRepo,
        PostRepository $postRepo,
        UserRepository $userRepo,
        Request $request
    ): JsonResponse {
        $user = $userRepo->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $subscriptions = $subscriptionRepo->findBy(['subscriber' => $user]);

        if (empty($subscriptions)) {
            return new JsonResponse([
                'posts' => [],
                'previous_page' => null,
                'next_page' => null,
            ]);
        }

        $subscribedUserIds = array_map(fn($sub) => $sub->getSubscribedTo()->getId(), $subscriptions);
        
        if (empty($subscribedUserIds)) {
            return new JsonResponse([
                'posts' => [],
                'previous_page' => null,
                'next_page' => null,
            ]);
        }

        $page = (int) $request->query->get('page', 1);
        $limit = 15;

        $allPosts = $postRepo->createQueryBuilder('p')
            ->where('p.user IN (:subscribedUserIds)')
            ->setParameter('subscribedUserIds', $subscribedUserIds)
            ->orderBy('p.created_at', 'DESC')
            ->getQuery()
            ->getResult();

        $paginatedData = $this->PostService->paginatePosts($allPosts, $page, $limit);

        $baseUrl = $this->getParameter('base_url');
        $uploadDir = $this->getParameter('upload_directory');
        $currentUser = $this->getUser();

        $formattedPosts = [];
        foreach ($paginatedData['posts'] as $post) {
            $formattedPosts[] = $this->PostService->formatPostDetails($post, $currentUser, $baseUrl, $uploadDir);
        }

        return $this->json([
            'posts' => $formattedPosts,
            'previous_page' => $paginatedData['previous_page'],
            'next_page' => $paginatedData['next_page'],
        ]);
    }

    #[Route('/unsubscribe/{id}', name: 'unsubscribe_user', methods: ['DELETE'])]
    public function unsubscribe(User $user, SubscriptionRepository $subscriptionRepo, EntityManagerInterface $em): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $subscription = $subscriptionRepo->findOneBy([
            'subscriber' => $currentUser,
            'subscribedTo' => $user,
        ]);

        if (!$subscription) {
            return new JsonResponse(['error' => 'Subscription not found'], 404);
        }

        $em->remove($subscription);
        $em->flush();

        return new JsonResponse(['message' => 'Unsubscribed successfully']);
    }

    #[Route('/subscribe/{id}', name: 'subscribe_user', methods: ['POST'])]
    public function subscribe(
        User $user, 
        SubscriptionRepository $subscriptionRepo, 
        EntityManagerInterface $em,
        UserBlockRepository $userBlockRepository
    ): JsonResponse {
        $currentUser = $this->getUser();

        if (!$currentUser) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        if ($currentUser === $user) {
            return new JsonResponse(['error' => 'You cannot subscribe to yourself'], 400);
        }

        if ($userBlockRepository->isBlocked($user, $currentUser)) {
            return new JsonResponse(['error' => 'You cannot subscribe to this user'], 403);
        }

        if ($userBlockRepository->isBlocked($currentUser, $user)) {
            return new JsonResponse(['error' => 'You must unblock this user before subscribing'], 403);
        }

        $existingSubscription = $subscriptionRepo->findOneBy([
            'subscriber' => $currentUser,
            'subscribedTo' => $user,
        ]);

        if ($existingSubscription) {
            return new JsonResponse(['error' => 'Already subscribed'], 400);
        }

        $subscription = new Subscription();
        $subscription->setSubscriber($currentUser);
        $subscription->setSubscribedTo($user);

        $em->persist($subscription);
        $em->flush();

        return new JsonResponse(['message' => 'Subscribed successfully']);
    }

    #[Route('/subscriptions/check/{id}', name: 'check_subscription', methods: ['GET'])]
    public function checkSubscription(int $id, SubscriptionRepository $subscriptionRepo): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $subscription = $subscriptionRepo->findOneBy([
            'subscriber' => $currentUser,
            'subscribedTo' => $id,
        ]);

        return new JsonResponse(['isSubscribed' => $subscription !== null]);
    }

    #[Route('/subscriptions/count/{id}', name: 'subscriptions_count', methods: ['GET'])]
    public function getSubscriptionsCount(int $id, SubscriptionRepository $subscriptionRepo, UserRepository $userRepo): JsonResponse
    {
        $user = $userRepo->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $followersCount = $subscriptionRepo->count(['subscribedTo' => $user]);
        $followingCount = $subscriptionRepo->count(['subscriber' => $user]);

        return new JsonResponse([
            'followers' => $followersCount,
            'following' => $followingCount,
        ]);
    }
}