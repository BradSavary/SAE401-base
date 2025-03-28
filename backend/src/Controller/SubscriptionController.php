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
    User $user,
    SubscriptionRepository $subscriptionRepo,
    PostRepository $postRepo
): JsonResponse {
    $subscriptions = $subscriptionRepo->findBy(['subscriber' => $user]);

    if (!$subscriptions) {
        return new JsonResponse(['error' => 'No subscriptions found'], 404);
    }

    $subscribedUserIds = array_map(fn($sub) => $sub->getSubscribedTo()->getId(), $subscriptions);

    $posts = $postRepo->findBy(['user' => $subscribedUserIds], ['created_at' => 'DESC']);

    // Récupérer les paramètres pour construire les URLs des avatars
    $baseUrl = $this->getParameter('base_url'); // Assurez-vous que ce paramètre est défini dans votre configuration
    $uploadDir = $this->getParameter('upload_directory');

    $currentUser = $this->getUser();

    // Transform posts into an array to avoid circular references
    $postData = array_map(function ($post) use ($baseUrl, $uploadDir, $currentUser) {
        $user = $post->getUser();
        $avatarUrl = $user->getAvatar() ? $baseUrl . '/' . $uploadDir . '/' . $user->getAvatar() : null;

        $isLiked = $currentUser ? $post->isLikedByUser($currentUser) : false;

        return [
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'avatar' => $avatarUrl,
            ],
            'likes' => $post->getLikesCount(),
            'userLiked' => $isLiked,
        ];
    }, $posts);

    return new JsonResponse($postData);
}
}