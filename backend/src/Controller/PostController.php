<?php

namespace App\Controller;

use App\Dto\Payload\CreatePostPayload;
use App\Entity\Post;
use App\Entity\User;
use App\Service\PostService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\PostRepository;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Security\Core\Security;
use App\Repository\PostInteractionRepository;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

final class PostController extends AbstractController
{
    private PostService $PostService;

    public function __construct(PostService $PostService)
    {
        $this->PostService = $PostService;
    }

    #[Route('/posts', name: 'posts.index', methods: ['GET'])]
    public function index(Request $request, PostRepository $postRepository): Response
    {
        $page = (int) $request->query->get('page', 1);
        $limit = 15;

        $allPosts = $postRepository->findBy([], ['created_at' => 'DESC']);
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

    #[Route('/posts', name: 'posts.create', methods: ['POST'])]
    public function create(
        Request $request,
        SerializerInterface $serializer,
        ValidatorInterface $validator,
        PostService $postService, 
        EntityManagerInterface $entityManager
    ): Response {
        try {
            /** @var User|null $currentUser */
            $currentUser = $this->getUser();
        
            if (!$currentUser) {
                return new JsonResponse(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
            }
        
            $content = $request->request->get('content');
            if (empty($content)) {
                return new JsonResponse(['error' => 'Content is required'], Response::HTTP_BAD_REQUEST);
            }
        
            $payload = new CreatePostPayload();
            $payload->setContent($content);
            
            // On utilise la méthode de réflexion pour récupérer l'ID de l'utilisateur
            $reflection = new \ReflectionObject($currentUser);
            $idProperty = $reflection->getProperty('id');
            $idProperty->setAccessible(true);
            $userId = $idProperty->getValue($currentUser);
            
            if (!$userId) {
                return new JsonResponse(['error' => 'Could not determine user ID'], Response::HTTP_BAD_REQUEST);
            }
            $payload->setUserId($userId);
        
            // Récupérer et valider les fichiers média
            $mediaFiles = $request->files->get('media');
            
            // Déboguer les données reçues
            $debugData = [
                'content' => $content,
                'user_id' => $userId,
                'mediaFiles_type' => gettype($mediaFiles),
                'files_keys' => array_keys($request->files->all()),
                'has_media' => $request->files->has('media')
            ];
            
            if (!empty($mediaFiles)) {
                // Si un seul fichier est envoyé, on le met dans un tableau
                if (!is_array($mediaFiles)) {
                    $mediaFiles = [$mediaFiles];
                }
                
                // Log pour le débogage
                $fileInfo = [];
                foreach ($mediaFiles as $index => $file) {
                    if ($file instanceof UploadedFile) {
                        $fileInfo[] = [
                            'index' => $index,
                            'originalName' => $file->getClientOriginalName(),
                            'mimeType' => $file->getMimeType(),
                            'size' => $file->getSize(),
                            'error' => $file->getError(),
                            'path' => $file->getPathname(),
                            'exists' => file_exists($file->getPathname())
                        ];
                    } else {
                        $fileInfo[] = [
                            'index' => $index,
                            'type' => gettype($file),
                            'value' => is_object($file) ? get_class($file) : (is_scalar($file) ? $file : 'not scalar')
                        ];
                    }
                }
                
                $debugData['fileInfo'] = $fileInfo;
                $payload->setMedia($mediaFiles);
            }
        
            // Vérifier si on a des erreurs de validation
            $errors = $validator->validate($payload);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[] = $error->getMessage();
                }
                return new JsonResponse([
                    'errors' => $errorMessages,
                    'debug' => $debugData
                ], Response::HTTP_BAD_REQUEST);
            }
        
            $postService->create($payload);
        
            return new JsonResponse(['status' => 'Post created successfully'], Response::HTTP_CREATED);
        } catch (\RuntimeException $e) {
            return new JsonResponse([
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'debug' => $debugData ?? null
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'debug' => $debugData ?? null
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

#[Route('/posts/user/{id}', name: 'posts.user', methods: ['GET'])]
public function getUserPosts(
    int $id,
    Request $request,
    PostRepository $postRepository,
    EntityManagerInterface $entityManager
): JsonResponse {
    $user = $entityManager->getRepository(User::class)->find($id);

    if (!$user) {
        return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
    }

    $allPosts = $postRepository->findBy(['user' => $user], ['created_at' => 'DESC']);

    $page = (int) $request->query->get('page', 1);
    $limit = 15; // Nombre de posts par page
    $paginatedData = $this->PostService->paginatePosts($allPosts, $page, $limit);

    $baseUrl = $this->getParameter('base_url');
    $uploadDir = $this->getParameter('upload_directory');
    $currentUser = $this->getUser();

    $formattedPosts = [];
    foreach ($paginatedData['posts'] as $post) {
        $formattedPosts[] = $this->PostService->formatPostDetails($post, $currentUser, $baseUrl, $uploadDir);
    }

    return new JsonResponse([
        'posts' => $formattedPosts,
        'previous_page' => $paginatedData['previous_page'],
        'next_page' => $paginatedData['next_page'],
    ], JsonResponse::HTTP_OK);
}


#[Route('/posts/{id}', name: 'posts.delete', methods: ['DELETE'])]
#[IsGranted("ROLE_USER")]
public function delete(int $id, PostRepository $postRepository, EntityManagerInterface $entityManager): JsonResponse
{
    try {
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        /** @var User $currentUser */
        $currentUser = $this->getUser();

        if ($this->isGranted('ROLE_ADMIN') || $post->getUser() === $currentUser) {
            // Supprimer les fichiers médias associés au post
            foreach ($post->getMedia() as $media) {
                $fileName = $media->getFilename();
                if ($fileName) {
                    $filePath = dirname(__DIR__, 2) . '/public/uploads/media/' . $fileName;
                    if (file_exists($filePath)) {
                        unlink($filePath); // Supprime le fichier
                    }
                }
            }

            $entityManager->remove($post);
            $entityManager->flush();

            return new JsonResponse(['status' => 'Post deleted'], JsonResponse::HTTP_NO_CONTENT);
        }

        return new JsonResponse(['error' => 'Unauthorized'], JsonResponse::HTTP_UNAUTHORIZED);
    } catch (\Exception $e) {
        return new JsonResponse([
            'error' => 'An error occurred while deleting the post: ' . $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
    }
}

    #[Route('/posts/liked/{id}', name: 'posts.liked', methods: ['GET'])]
    public function getLikedPostsByUser(
        int $id,
        Request $request,
        PostInteractionRepository $postInteractionRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $entityManager->getRepository(User::class)->find($id);
    
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }
    
        $likedPosts = $postInteractionRepository->findLikedPostsByUser($user);
    
        $page = (int) $request->query->get('page', 1);
        $limit = 15; // Nombre de posts par page
        $paginatedData = $this->PostService->paginatePosts($likedPosts, $page, $limit);
    
        $baseUrl = $this->getParameter('base_url');
        $uploadDir = $this->getParameter('upload_directory');
        $currentUser = $this->getUser();
    
        $formattedPosts = [];
        foreach ($paginatedData['posts'] as $interaction) {
            $post = $interaction->getPost();
            $formattedPosts[] = $this->PostService->formatPostDetails($post, $currentUser, $baseUrl, $uploadDir);
        }
    
        return new JsonResponse([
            'posts' => $formattedPosts,
            'previous_page' => $paginatedData['previous_page'],
            'next_page' => $paginatedData['next_page'],
        ], JsonResponse::HTTP_OK);
    }
}