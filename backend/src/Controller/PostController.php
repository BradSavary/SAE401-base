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
    #[Route('/posts', name: 'posts.index', methods: ['GET'])]
    public function index(Request $request, PostRepository $postRepository): Response
{
    $page = (int) $request->query->get('page', 1);
    $offset = ($page - 1) * 15;

    $paginator = $postRepository->paginateAllOrderedByLatest($offset, 15);
    $totalPostsCount = $paginator->count();

    $previousPage = $page > 1 ? $page - 1 : null;
    $nextPage = ($offset + 15) < $totalPostsCount ? $page + 1 : null;

    $baseUrl = $this->getParameter('base_url');
    $uploadDir = $this->getParameter('upload_directory');

    $currentUser = $this->getUser();

    $posts = [];
    foreach ($paginator as $post) {
        $user = $post->getUser();

        $avatarUrl = $user->getAvatar() ? $baseUrl . '/' . $uploadDir . '/' . $user->getAvatar() : null;
        $isLiked = $currentUser ? $post->isLikedByUser($currentUser) : false;

        $postData = [
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'created_at' => $post->getCreatedAt(),
            'username' => $user->getUsername(),
            'avatar' => $avatarUrl,
            'user_id' => $user->getId(),
            'likes' => $post->getLikesCount(),
            'userLiked' => $isLiked,
            'isBlocked' => $user->getIsBlocked(),
        ];

        if ($user->getIsBlocked()) {
            $postData['content'] = 'This account has been blocked for violating the terms of use.';
            $postData['likes'] = 0;
            $postData['userLiked'] = false;
        }

        $posts[] = $postData;
    }

    return $this->json([
        'posts' => $posts,
        'previous_page' => $previousPage,
        'next_page' => $nextPage
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
public function getUserPosts(int $id, PostRepository $postRepository, EntityManagerInterface $entityManager): JsonResponse
{
    $user = $entityManager->getRepository(User::class)->find($id);

    if (!$user) {
        return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
    }

    $posts = $postRepository->findBy(['user' => $user], ['created_at' => 'DESC']);

    $baseUrl = $this->getParameter('base_url');
    $uploadDir = $this->getParameter('upload_directory');
    $currentUser = $this->getUser();

    $postData = [];
    foreach ($posts as $post) {
        $avatarUrl = $user->getAvatar() ? $baseUrl . '/' . $uploadDir . '/' . $user->getAvatar() : null;
        $isLiked = $currentUser ? $post->isLikedByUser($currentUser) : false;

        $postDetails = [
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'created_at' => $post->getCreatedAt(),
            'username' => $user->getUsername(),
            'avatar' => $avatarUrl,
            'user_id' => $user->getId(),
            'likes' => $post->getLikesCount(),
            'userLiked' => $isLiked,
            'isBlocked' => $user->getIsBlocked(), // Ajout de l'état de blocage
        ];

        if ($user->getIsBlocked()) {
            $postDetails['content'] = 'This account has been blocked for violating the terms of use.';
            $postDetails['likes'] = 0;
            $postDetails['userLiked'] = false;
        }

        $postData[] = $postDetails;
    }

    return new JsonResponse($postData, JsonResponse::HTTP_OK);
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
        PostInteractionRepository $postInteractionRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $entityManager->getRepository(User::class)->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $likedPosts = $postInteractionRepository->findLikedPostsByUser($user);

        $baseUrl = $this->getParameter('base_url');
        $uploadDir = $this->getParameter('upload_directory');
        $currentUser = $this->getUser();

        $postData = [];
        foreach ($likedPosts as $interaction) {
            $post = $interaction->getPost();
            $postUser = $post->getUser();
            $avatarUrl = $postUser->getAvatar() ? $baseUrl . '/' . $uploadDir . '/' . $postUser->getAvatar() : null;
            $isLiked = $currentUser ? $post->isLikedByUser($currentUser) : false;

            $postDetails = [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt(),
                'username' => $postUser->getUsername(),
                'avatar' => $avatarUrl,
                'user_id' => $postUser->getId(),
                'likes' => $post->getLikesCount(),
                'userLiked' => $isLiked,
                'isBlocked' => $postUser->getIsBlocked(),
            ];

            if ($postUser->getIsBlocked()) {
                $postDetails['content'] = 'This account has been blocked for violating the terms of use.';
                $postDetails['likes'] = 0;
                $postDetails['userLiked'] = false;
            }

            $postData[] = $postDetails;
        }

        return new JsonResponse($postData, JsonResponse::HTTP_OK);
    }
}