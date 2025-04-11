<?php

namespace App\Controller;

use App\Entity\Retweet;
use App\Entity\Post;
use App\Entity\User;
use App\Repository\RetweetRepository;
use App\Repository\PostRepository;
use App\Repository\UserBlockRepository;
use App\Repository\UserRepository;
use App\Service\PostService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class RetweetController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private PostService $postService;

    public function __construct(
        EntityManagerInterface $entityManager,
        PostService $postService
    ) {
        $this->entityManager = $entityManager;
        $this->postService = $postService;
    }

    #[Route('/posts/{postId}/retweet', name: 'post_retweet', methods: ['POST'])]
    #[IsGranted("ROLE_USER")]
    public function retweet(
        int $postId,
        Request $request,
        RetweetRepository $retweetRepository,
        PostRepository $postRepository,
        UserBlockRepository $userBlockRepository
    ): JsonResponse {
        // Récupérer l'utilisateur connecté
        /** @var User $currentUser */
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return new JsonResponse(['message' => 'User not authenticated'], 401);
        }

        // Vérifier si le post existe
        $post = $postRepository->find($postId);
        if (!$post) {
            return new JsonResponse(['message' => 'Post not found'], 404);
        }

        // Vérifier si l'utilisateur a déjà retweeté ce post
        $existingRetweet = $retweetRepository->findOneBy([
            'originalPost' => $post,
            'user' => $currentUser
        ]);
        if ($existingRetweet) {
            return new JsonResponse(['message' => 'Post already retweeted by user'], 400);
        }

        // Vérifier si l'utilisateur est bloqué par l'auteur du post
        $postAuthor = $post->getUser();
        if ($userBlockRepository->isBlocked($postAuthor, $currentUser)) {
            return new JsonResponse(['message' => 'You cannot retweet this post'], 403);
        }

        // Vérifier si l'utilisateur a bloqué l'auteur du post
        if ($userBlockRepository->isBlocked($currentUser, $postAuthor)) {
            return new JsonResponse(['message' => 'You have blocked the author of this post'], 403);
        }

        // Créer un nouveau retweet
        $retweet = new Retweet();
        $retweet->setUser($currentUser);
        $retweet->setOriginalPost($post);

        $this->entityManager->persist($retweet);
        $this->entityManager->flush();

        // Récupérer le nombre de retweets pour ce post
        $retweetCount = $retweetRepository->countByPost($postId);

        return new JsonResponse([
            'message' => 'Post retweeted successfully',
            'retweet_count' => $retweetCount
        ], 201);
    }

    #[Route('/posts/{postId}/retweet', name: 'post_undo_retweet', methods: ['DELETE'])]
    #[IsGranted("ROLE_USER")]
    public function undoRetweet(
        int $postId,
        RetweetRepository $retweetRepository,
        PostRepository $postRepository
    ): JsonResponse {
        // Récupérer l'utilisateur connecté
        /** @var User $currentUser */
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return new JsonResponse(['message' => 'User not authenticated'], 401);
        }

        // Vérifier si le post existe
        $post = $postRepository->find($postId);
        if (!$post) {
            return new JsonResponse(['message' => 'Post not found'], 404);
        }

        // Trouver le retweet à supprimer
        $retweet = $retweetRepository->findOneBy([
            'originalPost' => $post,
            'user' => $currentUser
        ]);
        
        if (!$retweet) {
            return new JsonResponse(['message' => 'Retweet not found'], 404);
        }

        // Supprimer le retweet
        $this->entityManager->remove($retweet);
        $this->entityManager->flush();

        // Récupérer le nombre de retweets mis à jour pour ce post
        $retweetCount = $retweetRepository->countByPost($postId);

        return new JsonResponse([
            'message' => 'Retweet removed successfully',
            'retweet_count' => $retweetCount
        ], 200);
    }

    #[Route('/posts/{postId}/retweet', name: 'post_get_retweets', methods: ['GET'])]
    public function getRetweetCount(
        int $postId,
        RetweetRepository $retweetRepository,
        PostRepository $postRepository
    ): JsonResponse {
        // Vérifier si le post existe
        $post = $postRepository->find($postId);
        if (!$post) {
            return new JsonResponse(['message' => 'Post not found'], 404);
        }

        // Compter les retweets
        $retweetCount = $retweetRepository->countByPost($postId);

        // Vérifier si l'utilisateur connecté a retweeté ce post
        $userRetweeted = false;
        /** @var User|null $currentUser */
        $currentUser = $this->getUser();
        
        if ($currentUser) {
            $existingRetweet = $retweetRepository->findOneBy([
                'originalPost' => $post,
                'user' => $currentUser
            ]);
            $userRetweeted = $existingRetweet !== null;
        }

        return new JsonResponse([
            'retweet_count' => $retweetCount,
            'user_retweeted' => $userRetweeted
        ]);
    }

    #[Route('/user/{userId}/retweets', name: 'user_retweets', methods: ['GET'])]
    public function getUserRetweets(
        int $userId, 
        Request $request,
        RetweetRepository $retweetRepository,
        UserBlockRepository $userBlockRepository,
        UserRepository $userRepository
    ): JsonResponse {
        // Récupérer l'utilisateur concerné
        $targetUser = $userRepository->find($userId);
        if (!$targetUser) {
            return new JsonResponse(['message' => 'User not found'], 404);
        }
        
        // Récupérer les retweets de l'utilisateur
        $retweets = $retweetRepository->findBy(['user' => $targetUser], ['created_at' => 'DESC']);
        
        $baseUrl = $request->getSchemeAndHttpHost();
        $uploadDir = 'uploads/avatars';
        
        $postsData = [];
        /** @var User|null $currentUser */
        $currentUser = $this->getUser();
        
        foreach ($retweets as $retweet) {
            $post = $retweet->getOriginalPost();
            $postAuthor = $post->getUser();
            
            // Vérifier les blocages entre l'utilisateur courant et l'auteur du post
            $isUserBlockedOrBlocking = false;
            if ($currentUser) {
                $isUserBlockedOrBlocking = 
                    $userBlockRepository->isBlocked($postAuthor, $currentUser) || 
                    $userBlockRepository->isBlocked($currentUser, $postAuthor);
            }
            
            if (!$isUserBlockedOrBlocking && !$postAuthor->getIsBlocked()) {
                $postData = $this->postService->formatPostDetails($post, $currentUser, $baseUrl, $uploadDir);
                $postData['retweeted_by'] = [
                    'user_id' => $retweet->getUser()->getId(),
                    'username' => $retweet->getUser()->getUsername(),
                    'retweeted_at' => [
                        'date' => $retweet->getCreatedAt()->format('Y-m-d H:i:s'),
                        'timezone_type' => 3,
                        'timezone' => $retweet->getCreatedAt()->getTimezone()->getName(),
                    ]
                ];
                $postsData[] = $postData;
            }
        }
        
        return new JsonResponse([
            'posts' => $postsData
        ]);
    }
} 