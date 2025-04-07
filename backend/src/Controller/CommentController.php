<?php

namespace App\Controller;

use App\Dto\Payload\CreateCommentPayload;
use App\Entity\Comment;
use App\Service\CommentService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use App\Repository\CommentRepository;
use App\Repository\PostRepository;
use App\Repository\UserBlockRepository;

class CommentController extends AbstractController
{
    private CommentService $commentService;

    public function __construct(CommentService $commentService)
    {
        $this->commentService = $commentService;
    }

    /**
     * Récupérer tous les commentaires d'un post
     */
    #[Route('/posts/{postId}/comments', name: 'post_comments', methods: ['GET'])]
    public function getPostComments(
        int $postId,
        CommentRepository $commentRepository,
        PostRepository $postRepository
    ): JsonResponse {
        // Vérifier si le post existe
        $post = $postRepository->find($postId);
        if (!$post) {
            return new JsonResponse(['error' => 'Post non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $comments = $commentRepository->findByPost($postId);
        $baseUrl = $this->getParameter('base_url');

        $formattedComments = [];
        foreach ($comments as $comment) {
            $formattedComments[] = $this->commentService->formatCommentDetails($comment, $baseUrl);
        }

        return new JsonResponse(['comments' => $formattedComments]);
    }

    /**
     * Créer un nouveau commentaire
     */
    #[Route('/comments', name: 'comment_create', methods: ['POST'])]
    #[IsGranted("ROLE_USER")]
    public function create(
        Request $request,
        SerializerInterface $serializer,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager,
        PostRepository $postRepository,
        UserBlockRepository $userBlockRepository
    ): JsonResponse {
        try {
            // Récupérer l'utilisateur courant
            $currentUser = $this->getUser();
            if (!$currentUser) {
                return new JsonResponse(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
            }

            // Décoder les données de la requête
            $data = json_decode($request->getContent(), true);

            // Créer et remplir le DTO
            $payload = new CreateCommentPayload();
            $payload->setContent($data['content'] ?? null);
            $payload->setPostId($data['post_id'] ?? null);

            // Utiliser l'ID de l'utilisateur authentifié
            $reflection = new \ReflectionObject($currentUser);
            $idProperty = $reflection->getProperty('id');
            $idProperty->setAccessible(true);
            $userId = $idProperty->getValue($currentUser);
            
            if (!$userId) {
                return new JsonResponse(['error' => 'Impossible de déterminer l\'ID utilisateur'], Response::HTTP_BAD_REQUEST);
            }
            $payload->setUserId($userId);

            // Valider le DTO
            $errors = $validator->validate($payload);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[] = $error->getMessage();
                }
                return new JsonResponse(['errors' => $errorMessages], Response::HTTP_BAD_REQUEST);
            }

            // Vérifier si le post existe
            $post = $postRepository->find($payload->getPostId());
            if (!$post) {
                return new JsonResponse(['error' => 'Post non trouvé'], Response::HTTP_NOT_FOUND);
            }

            // Vérifier si l'utilisateur est bloqué par l'auteur du post
            $postAuthor = $post->getUser();
            if ($userBlockRepository->isBlocked($postAuthor, $currentUser)) {
                return new JsonResponse(['error' => 'Vous ne pouvez pas commenter ce post'], Response::HTTP_FORBIDDEN);
            }

            // Vérifier si l'utilisateur a bloqué l'auteur du post
            if ($userBlockRepository->isBlocked($currentUser, $postAuthor)) {
                return new JsonResponse(['error' => 'Vous avez bloqué l\'auteur de ce post'], Response::HTTP_FORBIDDEN);
            }

            // Vérifier si l'auteur du post a activé le mode lecture seule
            if ($postAuthor->getIsReadOnly()) {
                return new JsonResponse(['error' => 'Cet utilisateur a activé le mode lecture seule, les commentaires ne sont pas autorisés'], Response::HTTP_FORBIDDEN);
            }

            // Créer le commentaire
            $comment = $this->commentService->create($payload);
            $baseUrl = $this->getParameter('base_url');

            return new JsonResponse(
                [
                    'message' => 'Commentaire créé avec succès',
                    'comment' => $this->commentService->formatCommentDetails($comment, $baseUrl)
                ],
                Response::HTTP_CREATED
            );
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'Une erreur est survenue lors de la création du commentaire: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Mettre à jour un commentaire
     */
    #[Route('/comments/{id}', name: 'comment_update', methods: ['PUT', 'PATCH', 'POST'])]
    #[IsGranted("ROLE_USER")]
    public function update(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        CommentRepository $commentRepository
    ): JsonResponse {
        try {
            $currentUser = $this->getUser();
            if (!$currentUser) {
                return new JsonResponse(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
            }

            $data = json_decode($request->getContent(), true);
            $content = $data['content'] ?? null;

            if (empty($content)) {
                return new JsonResponse(['error' => 'Le contenu ne peut pas être vide'], Response::HTTP_BAD_REQUEST);
            }

            $comment = $commentRepository->find($id);
            if (!$comment) {
                return new JsonResponse(['error' => 'Commentaire non trouvé'], Response::HTTP_NOT_FOUND);
            }

            // Mise à jour du commentaire
            try {
                $updatedComment = $this->commentService->update($id, $content, $currentUser);
                $baseUrl = $this->getParameter('base_url');

                return new JsonResponse(
                    [
                        'message' => 'Commentaire mis à jour avec succès',
                        'comment' => $this->commentService->formatCommentDetails($updatedComment, $baseUrl)
                    ]
                );
            } catch (\Exception $e) {
                return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_FORBIDDEN);
            }
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'Une erreur est survenue lors de la mise à jour du commentaire: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Supprimer un commentaire
     */
    #[Route('/comments/{id}', name: 'comment_delete', methods: ['DELETE'])]
    #[IsGranted("ROLE_USER")]
    public function delete(
        int $id,
        CommentRepository $commentRepository
    ): JsonResponse {
        try {
            $currentUser = $this->getUser();
            if (!$currentUser) {
                return new JsonResponse(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
            }

            try {
                $this->commentService->delete($id, $currentUser);
                return new JsonResponse(['message' => 'Commentaire supprimé avec succès'], Response::HTTP_NO_CONTENT);
            } catch (\Exception $e) {
                if (str_contains($e->getMessage(), 'non trouvé')) {
                    return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
                }
                return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_FORBIDDEN);
            }
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'Une erreur est survenue lors de la suppression du commentaire: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Récupérer un commentaire spécifique
     */
    #[Route('/comments/{id}', name: 'comment_show', methods: ['GET'])]
    public function show(int $id, CommentRepository $commentRepository): JsonResponse
    {
        $comment = $commentRepository->find($id);
        if (!$comment) {
            return new JsonResponse(['error' => 'Commentaire non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $baseUrl = $this->getParameter('base_url');
        return new JsonResponse($this->commentService->formatCommentDetails($comment, $baseUrl));
    }

    /**
     * Récupérer tous les commentaires d'un utilisateur
     */
    #[Route('/users/{userId}/comments', name: 'user_comments', methods: ['GET'])]
    public function getUserComments(int $userId, CommentRepository $commentRepository): JsonResponse
    {
        $comments = $commentRepository->findByUser($userId);
        $baseUrl = $this->getParameter('base_url');

        $formattedComments = [];
        foreach ($comments as $comment) {
            $formattedComments[] = $this->commentService->formatCommentDetails($comment, $baseUrl);
        }

        return new JsonResponse(['comments' => $formattedComments]);
    }
} 