<?php

namespace App\Controller;

use App\Dto\Payload\CreatePostPayload;
use App\Entity\Post;
use App\Entity\User;
use App\Entity\PostMedia;
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

    #[Route('/posts/{id}', name: 'posts.show', methods: ['GET'])]
    public function show(
        int $id, 
        PostRepository $postRepository
    ): JsonResponse {
        try {
            $post = $postRepository->find($id);
            
            if (!$post) {
                return new JsonResponse(['error' => 'Post not found'], JsonResponse::HTTP_NOT_FOUND);
            }
            
            /** @var User $currentUser */
            $currentUser = $this->getUser();
            $baseUrl = $this->getParameter('base_url');
            $uploadDir = $this->getParameter('upload_directory');
            
            // Formatage du post pour l'API
            $formattedPost = $this->PostService->formatPostDetails($post, $currentUser, $baseUrl, $uploadDir);
            
            return new JsonResponse($formattedPost, JsonResponse::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'An error occurred: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/posts/{id}', name: 'posts.update', methods: ['PUT', 'PATCH', 'POST'])]
    #[IsGranted("ROLE_USER")]
    public function update(
        int $id,
        Request $request,
        PostRepository $postRepository,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        PostService $postService
    ): JsonResponse {
        try {
            // Support spécial pour les requêtes PUT avec multipart/form-data
            if ($request->getMethod() === 'PUT' || $request->getMethod() === 'PATCH') {
                $this->handlePutRequest($request);
            }
            
            // Log de débogage détaillé pour comprendre ce qui est reçu
            $requestData = [
                'method' => $request->getMethod(),
                'content_type' => $request->headers->get('Content-Type'),
                'query_params' => $request->query->all(),
                'request_params' => $request->request->all(),
                'files' => []
            ];
            
            // Log des fichiers reçus
            foreach ($request->files->all() as $key => $files) {
                if (is_array($files)) {
                    foreach ($files as $i => $file) {
                        $requestData['files'][$key][$i] = [
                            'name' => $file->getClientOriginalName(),
                            'type' => $file->getMimeType(),
                            'size' => $file->getSize(),
                            'error' => $file->getError()
                        ];
                    }
                } else {
                    $requestData['files'][$key] = [
                        'name' => $files->getClientOriginalName(),
                        'type' => $files->getMimeType(),
                        'size' => $files->getSize(),
                        'error' => $files->getError()
                    ];
                }
            }
            
            $post = $postRepository->find($id);
            
            if (!$post) {
                return new JsonResponse(['error' => 'Post not found'], JsonResponse::HTTP_NOT_FOUND);
            }
            
            /** @var User $currentUser */
            $currentUser = $this->getUser();
            
            // Vérifier que l'utilisateur est autorisé à modifier ce post
            if (!$this->isGranted('ROLE_ADMIN') && $post->getUser() !== $currentUser) {
                return new JsonResponse(['error' => 'You are not authorized to update this post'], JsonResponse::HTTP_FORBIDDEN);
            }
            
            // Récupérer le contenu mis à jour
            $content = $request->request->get('content');
            $requestData['content_received'] = $content;
            
            if ($content !== null && !empty(trim($content))) {
                $post->setContent($content);
                $requestData['content_updated'] = true;
            } else {
                $requestData['content_updated'] = false;
            }
            
            // Gérer les médias à supprimer
            $mediaToDelete = [];
            
            // Essayer de récupérer delete_media comme un tableau
            $deleteMediaParam = $request->request->all('delete_media');
            if (empty($deleteMediaParam)) {
                // Si c'est vide, essayer de récupérer comme une chaîne
                $deleteMediaString = $request->request->get('delete_media');
                if (!empty($deleteMediaString)) {
                    // Convertir la chaîne en tableau (valeurs séparées par des virgules)
                    $deleteMediaParam = explode(',', $deleteMediaString);
                }
            }
            
            $requestData['delete_media_param'] = $deleteMediaParam;
            
            if (!empty($deleteMediaParam)) {
                // Convertir en tableau plat
                if (is_array($deleteMediaParam)) {
                    foreach ($deleteMediaParam as $item) {
                        if (is_array($item)) {
                            $mediaToDelete = array_merge($mediaToDelete, $item);
                        } else {
                            $mediaToDelete[] = $item;
                        }
                    }
                } else {
                    $mediaToDelete = [$deleteMediaParam];
                }
            }
            
            $requestData['media_to_delete'] = $mediaToDelete;
            $requestData['media_deleted'] = [];
            
            if (!empty($mediaToDelete)) {
                foreach ($mediaToDelete as $mediaId) {
                    foreach ($post->getMedia() as $media) {
                        if ($media->getId() == $mediaId) {
                            // Supprimer le fichier physique
                            $fileName = $media->getFilename();
                            if ($fileName) {
                                $filePath = dirname(__DIR__, 2) . '/public/uploads/media/' . $fileName;
                                if (file_exists($filePath)) {
                                    unlink($filePath);
                                    $requestData['media_deleted'][] = [
                                        'id' => $mediaId,
                                        'filename' => $fileName,
                                        'file_deleted' => true
                                    ];
                                } else {
                                    $requestData['media_deleted'][] = [
                                        'id' => $mediaId,
                                        'filename' => $fileName,
                                        'file_deleted' => false,
                                        'reason' => 'File not found'
                                    ];
                                }
                            }
                            
                            // Supprimer l'entité
                            $post->removeMedia($media);
                            $entityManager->remove($media);
                            break;
                        }
                    }
                }
            }
            
            // Gérer les nouveaux médias
            $mediaFiles = $request->files->get('media');
            $requestData['media_files_received'] = !empty($mediaFiles);
            $requestData['media_added'] = [];
            
            if (!empty($mediaFiles)) {
                // Si un seul fichier est envoyé, on le met dans un tableau
                if (!is_array($mediaFiles)) {
                    $mediaFiles = [$mediaFiles];
                }
                
                $uploadDir = dirname(__DIR__, 2) . '/public/uploads/media';
                
                // Vérifier si le dossier existe, sinon le créer
                if (!file_exists($uploadDir)) {
                    if (!mkdir($uploadDir, 0777, true)) {
                        throw new \RuntimeException('Failed to create upload directory: ' . $uploadDir);
                    }
                }
                
                foreach ($mediaFiles as $mediaFile) {
                    if ($mediaFile instanceof UploadedFile) {
                        // Vérifier si le fichier est valide
                        if ($mediaFile->getError() !== UPLOAD_ERR_OK) {
                            $requestData['media_added'][] = [
                                'name' => $mediaFile->getClientOriginalName(),
                                'success' => false,
                                'reason' => 'Upload error: ' . $mediaFile->getError()
                            ];
                            continue; // Ignorer les fichiers invalides
                        }
                        
                        $fileName = uniqid() . '.' . $mediaFile->getClientOriginalExtension();
                        $filePath = $uploadDir . '/' . $fileName;
                        
                        try {
                            // Enregistrer directement le contenu du fichier
                            $content = file_get_contents($mediaFile->getRealPath());
                            if ($content === false) {
                                $requestData['media_added'][] = [
                                    'name' => $mediaFile->getClientOriginalName(),
                                    'success' => false,
                                    'reason' => 'Could not read file content'
                                ];
                                continue; // Ignorer si on ne peut pas lire le contenu
                            }
                            
                            $result = file_put_contents($filePath, $content);
                            if ($result === false) {
                                $requestData['media_added'][] = [
                                    'name' => $mediaFile->getClientOriginalName(),
                                    'success' => false,
                                    'reason' => 'Could not write file content'
                                ];
                                continue; // Ignorer si on ne peut pas écrire le fichier
                            }
                            
                            // Créer l'entité PostMedia et l'associer au post
                            $postMedia = new PostMedia();
                            $postMedia->setFilename($fileName);
                            $postMedia->setType($postService->determineMediaType($mediaFile->getMimeType()));
                            $postMedia->setPost($post);
                            
                            $entityManager->persist($postMedia);
                            $post->addMedia($postMedia);
                            
                            $requestData['media_added'][] = [
                                'name' => $mediaFile->getClientOriginalName(),
                                'success' => true,
                                'saved_as' => $fileName,
                                'type' => $postMedia->getType()
                            ];
                        } catch (\Exception $e) {
                            $requestData['media_added'][] = [
                                'name' => $mediaFile->getClientOriginalName(),
                                'success' => false,
                                'reason' => 'Exception: ' . $e->getMessage()
                            ];
                            continue; // Ignorer les erreurs pour passer au fichier suivant
                        }
                    }
                }
            }
            
            // Valider et sauvegarder le post
            $errors = $validator->validate($post);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[] = $error->getMessage();
                }
                return new JsonResponse([
                    'errors' => $errorMessages,
                    'debug' => $requestData
                ], JsonResponse::HTTP_BAD_REQUEST);
            }
            
            $entityManager->flush();
            
            // Récupérer et renvoyer le post mis à jour
            $baseUrl = $this->getParameter('base_url');
            $uploadDir = $this->getParameter('upload_directory');
            $formattedPost = $postService->formatPostDetails($post, $currentUser, $baseUrl, $uploadDir);
            
            return new JsonResponse([
                'status' => 'Post updated successfully',
                'post' => $formattedPost,
                'debug' => $requestData
            ], JsonResponse::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'An error occurred while updating the post: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'request_content' => $request->getContent(),
                'request_method' => $request->getMethod(),
                'request_format' => $request->getContentTypeFormat(),
                'debug' => $requestData ?? null
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Traite spécifiquement les requêtes PUT avec multipart/form-data
     */
    private function handlePutRequest(Request $request): void
    {
        // Les requêtes PUT ne traitent pas automatiquement les données multipart/form-data
        if (str_contains($request->headers->get('Content-Type', ''), 'multipart/form-data')) {
            $rawData = $request->getContent();
            if (!empty($rawData)) {
                // Trouver la limite (boundary)
                $contentType = $request->headers->get('Content-Type');
                preg_match('/boundary=(.*)$/', $contentType, $matches);
                $boundary = $matches[1];

                // Diviser le contenu par la limite
                $blocks = preg_split('/-+' . preg_quote($boundary, '/') . '/', $rawData);

                // Traiter chaque bloc
                foreach ($blocks as $block) {
                    if (empty($block)) continue;

                    // Extraire le nom du champ
                    preg_match('/name="([^"]*)"/', $block, $matches);
                    if (empty($matches)) continue;

                    $name = $matches[1];
                    
                    // Vérifier si c'est un fichier
                    if (strpos($block, 'filename="') !== false) {
                        // C'est un fichier
                        preg_match('/filename="([^"]*)"/', $block, $matches);
                        $filename = $matches[1];
                        
                        // Extraire le type MIME
                        preg_match('/Content-Type: ([^\r\n]*)/', $block, $matches);
                        $contentType = $matches[1] ?? 'application/octet-stream';
                        
                        // Extraire le contenu du fichier
                        $fileContent = substr($block, strpos($block, "\r\n\r\n") + 4);
                        
                        // Créer un fichier temporaire
                        $tempFile = tempnam(sys_get_temp_dir(), 'sf_upload');
                        file_put_contents($tempFile, $fileContent);
                        
                        // Créer un objet UploadedFile
                        $file = new UploadedFile(
                            $tempFile,
                            $filename,
                            $contentType,
                            null,
                            true // Marquer comme un fichier valide
                        );
                        
                        // Ajouter au request files
                        $request->files->set($name, $file);
                    } else {
                        // Champ normal
                        $value = substr($block, strpos($block, "\r\n\r\n") + 4);
                        $value = trim($value);
                        
                        // Ajouter à request
                        $request->request->set($name, $value);
                    }
                }
            }
        }
    }
}