<?php

namespace App\Service;

use App\Dto\Payload\CreatePostPayload;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UserRepository;
use App\Entity\Post;
use App\Entity\User;
use App\Entity\PostMedia;
use Symfony\Component\HttpFoundation\File\UploadedFile;


class PostService
{
    private EntityManagerInterface $entityManager;
    private UserRepository $userRepository;

    public function __construct(EntityManagerInterface $entityManager, UserRepository $userRepository)
    {
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
    }

    public function create(CreatePostPayload $payload): void
    {
        try {
            $user = $this->userRepository->find($payload->getUserId());
            if (!$user) {
                throw new \Exception('User not found');
            }
        
            $post = new Post();
            $post->setContent($payload->getContent());
            $post->setUser($user);
            $post->setAuthor($user);
            $post->setCreatedAt(new \DateTimeImmutable());
        
            // Gestion de l'upload des fichiers média
            $mediaFiles = $payload->getMedia();
            if (!empty($mediaFiles)) {
                $uploadDir = dirname(__DIR__, 2) . '/public/uploads/media';
                
                // Vérifier si le dossier existe, sinon le créer
                if (!file_exists($uploadDir)) {
                    if (!mkdir($uploadDir, 0777, true)) {
                        throw new \RuntimeException('Failed to create upload directory: ' . $uploadDir . '. Error: ' . error_get_last()['message']);
                    }
                }
                
                // Vérifier si le dossier est accessible en écriture
                if (!is_writable($uploadDir)) {
                    throw new \RuntimeException('Upload directory is not writable: ' . $uploadDir . '. Current permissions: ' . substr(sprintf('%o', fileperms($uploadDir)), -4));
                }
                
                foreach ($mediaFiles as $mediaFile) {
                    if ($mediaFile instanceof UploadedFile) {
                        // Vérifier si le fichier est valide
                        if ($mediaFile->getError() !== UPLOAD_ERR_OK) {
                            throw new \RuntimeException('Upload error: ' . $this->getUploadErrorMessage($mediaFile->getError()) . '. Original name: ' . $mediaFile->getClientOriginalName());
                        }
                        
                        $fileName = uniqid() . '.' . $mediaFile->getClientOriginalExtension();
                        $filePath = $uploadDir . '/' . $fileName;
                        
                        try {
                            // Enregistrer directement le contenu du fichier au lieu de le déplacer
                            $content = file_get_contents($mediaFile->getRealPath());
                            if ($content === false) {
                                throw new \RuntimeException('Could not read file content. Original name: ' . $mediaFile->getClientOriginalName());
                            }
                            
                            $result = file_put_contents($filePath, $content);
                            if ($result === false) {
                                throw new \RuntimeException('Could not write file content to destination. Path: ' . $filePath);
                            }
                            
                            // Vérifier que le fichier a bien été créé
                            if (!file_exists($filePath)) {
                                throw new \RuntimeException('File was not created successfully. Expected path: ' . $filePath);
                            }
                            
                            // Créer l'entité PostMedia et l'associer au post
                            $postMedia = new PostMedia();
                            $postMedia->setFilename($fileName);
                            $postMedia->setType($this->determineMediaType($mediaFile->getMimeType()));
                            $postMedia->setPost($post);
                            
                            $post->addMedia($postMedia);
                        } catch (\Exception $e) {
                            throw new \RuntimeException('Failed to save uploaded file: ' . $e->getMessage() . '. Original name: ' . $mediaFile->getClientOriginalName());
                        }
                    }
                }
            }
        
            $this->entityManager->persist($post);
            $this->entityManager->flush();
        } catch (\Exception $e) {
            throw new \RuntimeException('Error in PostService::create: ' . $e->getMessage(), 0, $e);
        }
    }

    private function determineMediaType(string $mimeType): string
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        } elseif (str_starts_with($mimeType, 'video/')) {
            return 'video';
        } elseif (str_starts_with($mimeType, 'audio/')) {
            return 'audio';
        }
        return 'unknown';
    }
    
    public function formatPostDetails(Post $post, ?User $currentUser, string $baseUrl, string $uploadDir): array
    {
        $user = $post->getUser();
        $avatarUrl = $user->getAvatar() ? $baseUrl . '/' . $uploadDir . '/' . $user->getAvatar() : null;
        $isLiked = $currentUser ? $post->isLikedByUser($currentUser) : false;
    
        $mediaUrls = [];
        foreach ($post->getMedia() as $media) {
            $mediaUrls[] = [
                'url' => $baseUrl . '/uploads/media/' . $media->getFilename(),
                'type' => $media->getType()
            ];
        }
    
        $createdAt = $post->getCreatedAt();
        $postDetails = [
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'created_at' => [
                'date' => $createdAt->format('Y-m-d H:i:s'),
                'timezone_type' => $createdAt->getTimezone()->getLocation()['timezone_type'] ?? 3,
                'timezone' => $createdAt->getTimezone()->getName(),
            ],
            'username' => $user->getUsername(),
            'avatar' => $avatarUrl,
            'user_id' => $user->getId(),
            'likes' => $post->getLikesCount(),
            'userLiked' => $isLiked,
            'isBlocked' => $user->getIsBlocked(),
            'media' => $mediaUrls,
        ];
    
        if ($user->getIsBlocked()) {
            $postDetails['content'] = 'This account has been blocked for violating the terms of use.';
            $postDetails['likes'] = 0;
            $postDetails['userLiked'] = false;
        }
    
        return $postDetails;
    }

public function paginatePosts(array $posts, int $page, int $limit): array
{
    $offset = ($page - 1) * $limit;
    $paginatedPosts = array_slice($posts, $offset, $limit);

    $totalPostsCount = count($posts);
    $previousPage = $page > 1 ? $page - 1 : null;
    $nextPage = ($offset + $limit) < $totalPostsCount ? $page + 1 : null;

    return [
        'posts' => $paginatedPosts,
        'previous_page' => $previousPage,
        'next_page' => $nextPage,
    ];
}

/**
 * Convertit le code d'erreur d'upload en message lisible
 */
private function getUploadErrorMessage(int $errorCode): string
{
    return match($errorCode) {
        UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
        UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form',
        UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload',
        UPLOAD_ERR_OK => 'There is no error, the file uploaded with success',
        default => 'Unknown upload error',
    };
}

}