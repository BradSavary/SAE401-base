<?php

namespace App\Controller;

use App\Entity\Subscription;
use App\Entity\User;
use App\Repository\PostRepository;
use App\Repository\SubscriptionRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use \DateTime;
use Symfony\Component\HttpFoundation\Request;

class SubscriptionController extends AbstractController
{
    #[Route('/subscribe/{id}', name: 'subscribe_user', methods: ['POST'])]
    public function subscribe(int $id, SubscriptionRepository $subscriptionRepo, EntityManagerInterface $em, UserRepository $userRepo): JsonResponse
{
    $currentUser = $this->getUser();

    if (!$currentUser) {
        return new JsonResponse(['error' => 'Unauthorized'], 401);
    }

    // Fetch the user to subscribe to using the ID
    $user = $userRepo->find($id);

    if (!$user) {
        return new JsonResponse(['error' => 'User not found'], 404);
    }

    // Vérifier si l'utilisateur tente de s'abonner à lui-même
    if ($currentUser instanceof User && $currentUser->getId() === $user->getId()) {
        return new JsonResponse(['error' => 'You cannot subscribe to yourself'], 400);
    }

    // Vérifier si l'abonnement existe déjà
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

    #[Route('/subscriptions/posts/{id}', name: 'subscriptions_posts', methods: ['GET'])]
    public function getSubscriptionsPosts(
        int $id,
        SubscriptionRepository $subscriptionRepo,
        PostRepository $postRepo,
        UserRepository $userRepo): JsonResponse
    {
        // Vérifiez si l'utilisateur existe
        $user = $userRepo->find($id);
    
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }
    
        // Récupérez les abonnements de l'utilisateur
        $subscriptions = $subscriptionRepo->findBy(['subscriber' => $user]);
    
        if (!$subscriptions) {
            return new JsonResponse(['error' => 'No subscriptions found'], 404);
        }
    
        // Récupérez les IDs des utilisateurs abonnés
        $subscribedUserIds = array_map(fn($sub) => $sub->getSubscribedTo()->getId(), $subscriptions);
    
        // Pagination
        $request = Request::createFromGlobals();
        $page = (int) $request->query->get('page', 1);
        $limit = 15;
        $offset = ($page - 1) * $limit;
    
        // Récupérez les posts des abonnements
        $paginator = $postRepo->createQueryBuilder('p')
            ->where('p.user IN (:subscribedUserIds)')
            ->setParameter('subscribedUserIds', $subscribedUserIds)
            ->orderBy('p.created_at', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    
        $totalPostsCount = count($postRepo->findBy(['user' => $subscribedUserIds]));
    
        $previousPage = $page > 1 ? $page - 1 : null;
        $nextPage = ($offset + $limit) < $totalPostsCount ? $page + 1 : null;
    
        // Récupérer les paramètres pour construire les URLs des avatars
        $baseUrl = $this->getParameter('base_url'); // Assurez-vous que ce paramètre est défini dans votre configuration
        $uploadDir = $this->getParameter('upload_directory');
    
        $currentUser = $this->getUser();
    
        $posts = [];
        foreach ($paginator as $post) {
            $user = $post->getUser();
            $avatarUrl = $user->getAvatar() ? $baseUrl . '/' . $uploadDir . '/' . $user->getAvatar() : null;
    
            $isLiked = $currentUser ? $post->isLikedByUser($currentUser) : false;
    
            $posts[] = [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format(\DateTime::ATOM), // Format ISO 8601
                'username' => $user->getUsername(),
                'avatar' => $avatarUrl,
                'user_id' => $user->getId(),
                'likes' => $post->getLikesCount(),
                'userLiked' => $isLiked,
            ];
        }
    
        return $this->json([
            'posts' => $posts,
            'previous_page' => $previousPage,
            'next_page' => $nextPage,
        ]);
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