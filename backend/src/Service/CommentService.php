<?php

namespace App\Service;

use App\Dto\Payload\CreateCommentPayload;
use App\Entity\Comment;
use App\Entity\Post;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UserRepository;
use App\Repository\PostRepository;
use App\Repository\CommentRepository;

class CommentService
{
    private EntityManagerInterface $entityManager;
    private UserRepository $userRepository;
    private PostRepository $postRepository;
    private CommentRepository $commentRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserRepository $userRepository,
        PostRepository $postRepository,
        CommentRepository $commentRepository
    ) {
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
        $this->postRepository = $postRepository;
        $this->commentRepository = $commentRepository;
    }

    /**
     * Créer un nouveau commentaire
     */
    public function create(CreateCommentPayload $payload): Comment
    {
        $user = $this->userRepository->find($payload->getUserId());
        if (!$user) {
            throw new \Exception('Utilisateur non trouvé');
        }

        $post = $this->postRepository->find($payload->getPostId());
        if (!$post) {
            throw new \Exception('Post non trouvé');
        }

        $comment = new Comment();
        $comment->setContent($payload->getContent());
        $comment->setUser($user);
        $comment->setPost($post);

        $this->entityManager->persist($comment);
        $this->entityManager->flush();

        return $comment;
    }

    /**
     * Mettre à jour un commentaire existant
     */
    public function update(int $commentId, string $content, User $user): Comment
    {
        $comment = $this->commentRepository->find($commentId);
        if (!$comment) {
            throw new \Exception('Commentaire non trouvé');
        }

        // Vérifier que l'utilisateur est l'auteur du commentaire
        if ($comment->getUser()->getId() !== $user->getId() && !in_array('ROLE_ADMIN', $user->getRoles())) {
            throw new \Exception('Vous n\'êtes pas autorisé à modifier ce commentaire');
        }

        $comment->setContent($content);
        $this->entityManager->flush();

        return $comment;
    }

    /**
     * Supprimer un commentaire
     */
    public function delete(int $commentId, User $user): void
    {
        $comment = $this->commentRepository->find($commentId);
        if (!$comment) {
            throw new \Exception('Commentaire non trouvé');
        }

        // Vérifier que l'utilisateur est l'auteur du commentaire ou admin
        if ($comment->getUser()->getId() !== $user->getId() && !in_array('ROLE_ADMIN', $user->getRoles())) {
            throw new \Exception('Vous n\'êtes pas autorisé à supprimer ce commentaire');
        }

        $this->entityManager->remove($comment);
        $this->entityManager->flush();
    }

    /**
     * Formater les détails d'un commentaire pour l'API
     */
    public function formatCommentDetails(Comment $comment, ?string $baseUrl = null): array
    {
        $user = $comment->getUser();
        $avatarUrl = null;
        
        if ($baseUrl && $user->getAvatar()) {
            $avatarUrl = $baseUrl . '/uploads/' . $user->getAvatar();
        }

        $createdAt = $comment->getCreatedAt();
        
        return [
            'id' => $comment->getId(),
            'content' => $comment->getContent(),
            'created_at' => [
                'date' => $createdAt->format('Y-m-d H:i:s'),
                'timezone_type' => $createdAt->getTimezone()->getLocation()['timezone_type'] ?? 3,
                'timezone' => $createdAt->getTimezone()->getName(),
            ],
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'avatar' => $avatarUrl,
                'is_blocked' => $user->getIsBlocked()
            ],
            'post_id' => $comment->getPost()->getId()
        ];
    }
} 