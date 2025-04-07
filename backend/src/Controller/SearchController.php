<?php

namespace App\Controller;

use App\Repository\HashtagRepository;
use App\Repository\PostRepository;
use App\Repository\UserRepository;
use App\Service\PostService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SearchController extends AbstractController
{
    private PostService $postService;
    private PostRepository $postRepository;
    private HashtagRepository $hashtagRepository;
    private UserRepository $userRepository;

    public function __construct(
        PostService $postService,
        PostRepository $postRepository,
        HashtagRepository $hashtagRepository,
        UserRepository $userRepository
    ) {
        $this->postService = $postService;
        $this->postRepository = $postRepository;
        $this->hashtagRepository = $hashtagRepository;
        $this->userRepository = $userRepository;
    }

    #[Route('/search', name: 'search', methods: ['GET'])]
    public function search(Request $request): JsonResponse
    {
        // Récupérer les paramètres de recherche
        $query = $request->query->get('q', '');
        $type = $request->query->get('type', 'all'); // all, posts, hashtags, users
        $page = (int) $request->query->get('page', 1);
        $limit = (int) $request->query->get('limit', 10);
        $startDate = $request->query->get('start_date');
        $endDate = $request->query->get('end_date');
        $userId = $request->query->get('user_id');

        // Valider les paramètres
        if (empty($query)) {
            return new JsonResponse(['error' => 'Search query is required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Convertir les dates si nécessaire
        $startDateTime = null;
        $endDateTime = null;
        
        if ($startDate) {
            try {
                $startDateTime = new \DateTime($startDate);
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Invalid start date format'], JsonResponse::HTTP_BAD_REQUEST);
            }
        }
        
        if ($endDate) {
            try {
                $endDateTime = new \DateTime($endDate);
                // Ajuster à la fin de la journée
                $endDateTime->setTime(23, 59, 59);
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Invalid end date format'], JsonResponse::HTTP_BAD_REQUEST);
            }
        }

        $results = [];
        $currentUser = $this->getUser();
        $baseUrl = $this->getParameter('base_url');
        $uploadDir = $this->getParameter('upload_directory');

        // Effectuer la recherche en fonction du type
        switch ($type) {
            case 'hashtags':
                $results = $this->searchHashtags($query, $page, $limit);
                break;
            
            case 'users':
                $results = $this->searchUsers($query, $page, $limit);
                break;
            
            case 'posts':
                $results = $this->searchPosts(
                    $query, 
                    $page, 
                    $limit, 
                    $currentUser, 
                    $baseUrl, 
                    $uploadDir, 
                    $startDateTime, 
                    $endDateTime, 
                    $userId
                );
                break;
            
            case 'all':
            default:
                // Recherche combinée
                $hashtagsResults = $this->searchHashtags($query, 1, 5);
                $usersResults = $this->searchUsers($query, 1, 5);
                $postsResults = $this->searchPosts(
                    $query, 
                    $page, 
                    $limit, 
                    $currentUser, 
                    $baseUrl, 
                    $uploadDir, 
                    $startDateTime, 
                    $endDateTime, 
                    $userId
                );
                
                $results = [
                    'hashtags' => $hashtagsResults['hashtags'] ?? [],
                    'users' => $usersResults['users'] ?? [],
                    'posts' => $postsResults['posts'] ?? [],
                    'total_hashtags' => $hashtagsResults['total'] ?? 0,
                    'total_users' => $usersResults['total'] ?? 0,
                    'total_posts' => $postsResults['total'] ?? 0,
                ];
                break;
        }

        return new JsonResponse($results);
    }

    #[Route('/hashtags/trending', name: 'trending_hashtags', methods: ['GET'])]
    public function trendingHashtags(Request $request): JsonResponse
    {
        $limit = (int) $request->query->get('limit', 10);
        $hashtags = $this->hashtagRepository->findMostPopular($limit);
        
        $formattedHashtags = [];
        foreach ($hashtags as $hashtag) {
            $formattedHashtags[] = [
                'id' => $hashtag[0]->getId(),
                'name' => $hashtag[0]->getName(),
                'post_count' => $hashtag['postCount'],
            ];
        }
        
        return new JsonResponse(['hashtags' => $formattedHashtags]);
    }

    #[Route('/hashtags/{name}/posts', name: 'hashtag_posts', methods: ['GET'])]
    public function getPostsByHashtag(string $name, Request $request): JsonResponse
    {
        $page = (int) $request->query->get('page', 1);
        $limit = (int) $request->query->get('limit', 10);
        
        // Normaliser le nom du hashtag
        $name = strtolower($name);
        
        // Récupérer le hashtag
        $hashtag = $this->hashtagRepository->findByName($name);
        
        if (!$hashtag) {
            return new JsonResponse(['error' => 'Hashtag not found'], JsonResponse::HTTP_NOT_FOUND);
        }
        
        // Récupérer les posts associés au hashtag
        $posts = $hashtag->getPosts()->toArray();
        
        // Filtrer éventuellement par date ou auteur
        $startDate = $request->query->get('start_date');
        $endDate = $request->query->get('end_date');
        $userId = $request->query->get('user_id');
        
        if ($startDate || $endDate || $userId) {
            $posts = array_filter($posts, function($post) use ($startDate, $endDate, $userId) {
                $createdAt = $post->getCreatedAt();
                
                if ($startDate && $createdAt < new \DateTime($startDate)) {
                    return false;
                }
                
                if ($endDate) {
                    $endDateTime = new \DateTime($endDate);
                    $endDateTime->setTime(23, 59, 59);
                    if ($createdAt > $endDateTime) {
                        return false;
                    }
                }
                
                if ($userId && $post->getUser()->getId() != $userId) {
                    return false;
                }
                
                return true;
            });
        }
        
        // Trier par date (plus récent en premier)
        usort($posts, function($a, $b) {
            return $b->getCreatedAt() <=> $a->getCreatedAt();
        });
        
        // Paginer les résultats
        $paginatedData = $this->postService->paginatePosts($posts, $page, $limit);
        
        $currentUser = $this->getUser();
        $baseUrl = $this->getParameter('base_url');
        $uploadDir = $this->getParameter('upload_directory');
        
        $formattedPosts = [];
        foreach ($paginatedData['posts'] as $post) {
            $formattedPosts[] = $this->postService->formatPostDetails($post, $currentUser, $baseUrl, $uploadDir);
        }
        
        return new JsonResponse([
            'hashtag' => [
                'id' => $hashtag->getId(),
                'name' => $hashtag->getName(),
                'post_count' => count($posts)
            ],
            'posts' => $formattedPosts,
            'previous_page' => $paginatedData['previous_page'],
            'next_page' => $paginatedData['next_page'],
        ]);
    }

    private function searchHashtags(string $query, int $page, int $limit): array
    {
        // Si la requête commence par #, on supprime ce caractère
        if (str_starts_with($query, '#')) {
            $query = substr($query, 1);
        }
        
        $hashtags = $this->hashtagRepository->findBySearchTerm($query, $limit);
        
        $formattedHashtags = [];
        foreach ($hashtags as $hashtag) {
            $formattedHashtags[] = [
                'id' => $hashtag->getId(),
                'name' => $hashtag->getName(),
                'post_count' => $hashtag->getPosts()->count()
            ];
        }
        
        return [
            'hashtags' => $formattedHashtags,
            'total' => count($formattedHashtags)
        ];
    }

    private function searchUsers(string $query, int $page, int $limit): array
    {
        // Si la requête commence par @, on supprime ce caractère
        if (str_starts_with($query, '@')) {
            $query = substr($query, 1);
        }
        
        $offset = ($page - 1) * $limit;
        $users = $this->userRepository->findBySearchTerm($query, $limit, $offset);
        $total = $this->userRepository->countBySearchTerm($query);
        
        $formattedUsers = [];
        $baseUrl = $this->getParameter('base_url');
        $uploadDir = $this->getParameter('upload_directory');
        
        foreach ($users as $user) {
            $avatarUrl = $user->getAvatar() ? $baseUrl . '/' . $uploadDir . '/' . $user->getAvatar() : null;
            
            $formattedUsers[] = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'avatar' => $avatarUrl,
                'is_blocked' => $user->getIsBlocked()
            ];
        }
        
        return [
            'users' => $formattedUsers,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ];
    }

    private function searchPosts(
        string $query, 
        int $page, 
        int $limit,
        $currentUser,
        string $baseUrl,
        string $uploadDir,
        ?\DateTime $startDate = null,
        ?\DateTime $endDate = null,
        ?string $userId = null
    ): array {
        // Vérifier si la requête est un hashtag
        $isHashtagSearch = str_starts_with($query, '#');
        $isMentionSearch = str_starts_with($query, '@');
        
        $searchResults = [];
        
        if ($isHashtagSearch) {
            // Recherche par hashtag
            $tagName = strtolower(substr($query, 1));
            $hashtag = $this->hashtagRepository->findByName($tagName);
            
            if ($hashtag) {
                $searchResults = $hashtag->getPosts()->toArray();
            }
        } elseif ($isMentionSearch) {
            // Recherche par mention
            $username = substr($query, 1);
            $searchResults = $this->postRepository->findPostsWithMention($username);
        } else {
            // Recherche par contenu
            $searchResults = $this->postRepository->findPostsByContent($query);
        }
        
        // Filtrer par date et utilisateur si nécessaire
        if ($startDate || $endDate || $userId) {
            $searchResults = array_filter($searchResults, function($post) use ($startDate, $endDate, $userId) {
                $createdAt = $post->getCreatedAt();
                
                if ($startDate && $createdAt < $startDate) {
                    return false;
                }
                
                if ($endDate && $createdAt > $endDate) {
                    return false;
                }
                
                if ($userId && $post->getUser()->getId() != $userId) {
                    return false;
                }
                
                return true;
            });
        }
        
        // Trier par date (plus récent en premier)
        usort($searchResults, function($a, $b) {
            return $b->getCreatedAt() <=> $a->getCreatedAt();
        });
        
        // Paginer les résultats
        $paginatedData = $this->postService->paginatePosts($searchResults, $page, $limit);
        
        $formattedPosts = [];
        foreach ($paginatedData['posts'] as $post) {
            $formattedPosts[] = $this->postService->formatPostDetails($post, $currentUser, $baseUrl, $uploadDir);
        }
        
        return [
            'posts' => $formattedPosts,
            'total' => count($searchResults),
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil(count($searchResults) / $limit),
            'previous_page' => $paginatedData['previous_page'],
            'next_page' => $paginatedData['next_page'],
        ];
    }
} 