<?php

namespace App\Controller;

use App\Dto\Payload\CreatePostPayload;
use App\Entity\Post;
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
use App\Entity\User;

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
    $currentUser = $this->getUser();

if ($currentUser->getIsBlocked()) {
    return new JsonResponse(['error' => 'Your account has been blocked. You cannot create posts.'], Response::HTTP_FORBIDDEN);
}

    $payload = $serializer->deserialize($request->getContent(), CreatePostPayload::class, 'json');

    $errors = $validator->validate($payload);
    if (count($errors) > 0) {
        return $this->json($errors, Response::HTTP_BAD_REQUEST);
    }

    // Appel au service PostService pour créer le post
    $postService->create($payload);

    return new JsonResponse(['status' => 'Post created'], Response::HTTP_CREATED);
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
        $post = $postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $currentUser = $this->getUser();

        if ($this->isGranted('ROLE_ADMIN')) {
            $entityManager->remove($post);
            $entityManager->flush();

            return new JsonResponse(["error"=>"Post deleted", 'status' => 'Post deleted'], JsonResponse::HTTP_NO_CONTENT);
        }

        if ($post->getUser() !== $currentUser) {
            return new JsonResponse(['error' => 'Unauthorized'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $entityManager->remove($post);
        $entityManager->flush();

        return new JsonResponse(["error"=>"Post deleted", 'status' => 'Post deleted'], JsonResponse::HTTP_NO_CONTENT);
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