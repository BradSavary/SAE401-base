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
use Symfony\Component\Security\Core\Security;
use App\Repository\PostRepository;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

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

        $posts = [];
        foreach ($paginator as $post) {
            $posts[] = [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt(),
                'username' => $post->getUser()->getUsername(),
            ];
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
        PostService $postService
    ): Response {
        $payload = $serializer->deserialize($request->getContent(), CreatePostPayload::class, 'json');

        $errors = $validator->validate($payload);
        if (count($errors) > 0) {
            return $this->json($errors, Response::HTTP_BAD_REQUEST);
        }

        // Appel au service PostService pour créer le post
        $postService->create($payload);

        return new JsonResponse(['status' => 'Post created'], Response::HTTP_CREATED);
    }
}