<?php

namespace App\Controller;

use App\Entity\Post;
use App\Entity\Comment;
use App\Entity\CommentInteraction;
use App\Entity\PostInteraction;
use App\Repository\PostRepository;
use App\Repository\CommentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Service\PostService;

/**
 * Contrôleur pour la modération et la censure de contenu
 */
#[Route('/moderation')]
#[IsGranted('ROLE_ADMIN')]
class ModerationController extends AbstractController
{
    private PostService $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    /**
     * Récupérer tous les posts pour modération
     */
    #[Route('/posts', name: 'moderation.list_posts', methods: ['GET'])]
    public function listPosts(
        Request $request,
        PostRepository $postRepository
    ): JsonResponse {
        // Récupérer les paramètres
        $page = (int) $request->query->get('page', 1);
        $limit = (int) $request->query->get('limit', 15);
        $search = $request->query->get('search', '');
        
        // Rechercher les posts
        if (!empty($search)) {
            $allPosts = $postRepository->findByContentLike($search);
        } else {
            $allPosts = $postRepository->findBy([], ['created_at' => 'DESC']);
        }
        
        // Paginer les résultats
        $paginatedData = $this->postService->paginatePosts($allPosts, $page, $limit);

        $baseUrl = $this->getParameter('base_url');
        $uploadDir = $this->getParameter('upload_directory');
        $currentUser = $this->getUser();

        $formattedPosts = [];
        foreach ($paginatedData['posts'] as $post) {
            $formattedPost = $this->postService->formatPostDetails($post, $currentUser, $baseUrl, $uploadDir);
            $formattedPost['is_censored'] = $post->isCensored();
            $formattedPosts[] = $formattedPost;
        }

        return $this->json([
            'posts' => $formattedPosts,
            'previous_page' => $paginatedData['previous_page'],
            'next_page' => $paginatedData['next_page'],
            'total' => count($allPosts),
        ]);
    }

    /**
     * Récupérer tous les commentaires pour modération
     */
    #[Route('/comments', name: 'moderation.list_comments', methods: ['GET'])]
    public function listComments(
        Request $request,
        CommentRepository $commentRepository
    ): JsonResponse {
        // Récupérer les paramètres
        $page = (int) $request->query->get('page', 1);
        $limit = (int) $request->query->get('limit', 15);
        $search = $request->query->get('search', '');
        
        // Rechercher les commentaires
        if (!empty($search)) {
            $allComments = $commentRepository->findByContentLike($search);
        } else {
            $allComments = $commentRepository->findBy([], ['created_at' => 'DESC']);
        }
        
        // Paginer les résultats
        $offset = ($page - 1) * $limit;
        $paginatedComments = array_slice($allComments, $offset, $limit);
        $total = count($allComments);

        $baseUrl = $this->getParameter('base_url');
        $uploadDir = $this->getParameter('upload_directory');

        $formattedComments = [];
        foreach ($paginatedComments as $comment) {
            $user = $comment->getUser();
            $post = $comment->getPost();
            
            $avatarUrl = $user->getAvatar() ? $baseUrl . '/' . $uploadDir . '/' . $user->getAvatar() : null;
            
            $formattedComments[] = [
                'id' => $comment->getId(),
                'content' => $comment->getContent(),
                'created_at' => [
                    'date' => $comment->getCreatedAt()->format('Y-m-d H:i:s'),
                    'timezone_type' => $comment->getCreatedAt()->getTimezone()->getOffset($comment->getCreatedAt()) / 3600,
                    'timezone' => $comment->getCreatedAt()->getTimezone()->getName(),
                ],
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'avatar' => $avatarUrl,
                    'is_blocked' => $user->getIsBlocked(),
                ],
                'post_id' => $post->getId(),
                'is_censored' => $comment->isCensored(),
            ];
        }

        return $this->json([
            'comments' => $formattedComments,
            'previous_page' => $page > 1 ? $page - 1 : null,
            'next_page' => $offset + $limit < $total ? $page + 1 : null,
            'total' => $total,
        ]);
    }

    /**
     * Censurer ou décensurer un post
     */
    #[Route('/posts/{id}/censor', name: 'moderation.censor_post', methods: ['POST'])]
    public function censorPost(
        int $id,
        Request $request,
        PostRepository $postRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $post = $postRepository->find($id);
        
        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        $isCensored = $data['is_censored'] ?? !$post->isCensored(); // Toggle by default
        
        $post->setIsCensored($isCensored);
        $entityManager->flush();
        
        $baseUrl = $this->getParameter('base_url');
        $uploadDir = $this->getParameter('upload_directory');
        $currentUser = $this->getUser();
        
        $formattedPost = $this->postService->formatPostDetails($post, $currentUser, $baseUrl, $uploadDir);
        $formattedPost['is_censored'] = $post->isCensored();
        
        return new JsonResponse([
            'message' => $isCensored ? 'Post has been censored' : 'Post has been uncensored',
            'post' => $formattedPost
        ], Response::HTTP_OK);
    }

    /**
     * Censurer ou décensurer un commentaire
     */
    #[Route('/comments/{id}/censor', name: 'moderation.censor_comment', methods: ['POST'])]
    public function censorComment(
        int $id,
        Request $request,
        CommentRepository $commentRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $comment = $commentRepository->find($id);
        
        if (!$comment) {
            return new JsonResponse(['error' => 'Comment not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        $isCensored = $data['is_censored'] ?? !$comment->isCensored(); // Toggle by default
        
        $comment->setIsCensored($isCensored);
        $entityManager->flush();
        
        $baseUrl = $this->getParameter('base_url');
        $uploadDir = $this->getParameter('upload_directory');
        $user = $comment->getUser();
        $avatarUrl = $user->getAvatar() ? $baseUrl . '/' . $uploadDir . '/' . $user->getAvatar() : null;
        
        return new JsonResponse([
            'message' => $isCensored ? 'Comment has been censored' : 'Comment has been uncensored',
            'comment' => [
                'id' => $comment->getId(),
                'content' => $comment->getContentWithCensorship(),
                'created_at' => [
                    'date' => $comment->getCreatedAt()->format('Y-m-d H:i:s'),
                    'timezone_type' => $comment->getCreatedAt()->getTimezone()->getOffset($comment->getCreatedAt()) / 3600,
                    'timezone' => $comment->getCreatedAt()->getTimezone()->getName(),
                ],
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'avatar' => $avatarUrl,
                    'is_blocked' => $user->getIsBlocked(),
                ],
                'post_id' => $comment->getPost()->getId(),
                'is_censored' => $comment->isCensored(),
            ]
        ], Response::HTTP_OK);
    }

    /**
     * Supprimer un post 
     */
    #[Route('/posts/{id}', name: 'moderation.delete_post', methods: ['DELETE'])]
    public function deletePost(
        int $id,
        PostRepository $postRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $post = $postRepository->find($id);
        
        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }
        
        try {
            // Manually delete post interactions first
            $query = $entityManager->createQuery(
                'DELETE FROM App\Entity\PostInteraction pi WHERE pi.post = :postId'
            );
            $query->setParameter('postId', $post->getId());
            $query->execute();
            
            // Delete all comments associated with this post
            $commentsQuery = $entityManager->createQuery(
                'DELETE FROM App\Entity\Comment c WHERE c.post = :postId'
            );
            $commentsQuery->setParameter('postId', $post->getId());
            $commentsQuery->execute();
            
            // Now delete the post
            $entityManager->remove($post);
            $entityManager->flush();
            
            return new JsonResponse([
                'message' => 'Post successfully deleted',
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            // Log the error for better troubleshooting
            error_log('Error deleting post: ' . $e->getMessage());
            return new JsonResponse([
                'error' => 'Failed to delete post: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Supprimer un commentaire
     */
    #[Route('/comments/{id}', name: 'moderation.delete_comment', methods: ['DELETE'])]
    public function deleteComment(
        int $id,
        CommentRepository $commentRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $comment = $commentRepository->find($id);
        
        if (!$comment) {
            return new JsonResponse(['error' => 'Comment not found'], Response::HTTP_NOT_FOUND);
        }
        
        try {
            // Manually delete comment interactions first
            $query = $entityManager->createQuery(
                'DELETE FROM App\Entity\CommentInteraction ci WHERE ci.comment = :commentId'
            );
            $query->setParameter('commentId', $comment->getId());
            $query->execute();
            
            // Now delete the comment
            $entityManager->remove($comment);
            $entityManager->flush();
            
            return new JsonResponse([
                'message' => 'Comment successfully deleted',
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            // Log the error for better troubleshooting
            error_log('Error deleting comment: ' . $e->getMessage());
            return new JsonResponse([
                'error' => 'Failed to delete comment: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 