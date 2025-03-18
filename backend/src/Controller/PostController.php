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
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Serializer\SerializerInterface;
use App\Repository\PostRepository;

final class PostController extends AbstractController
{
    #[Route('/posts', name: 'posts.index', methods: ['GET'])]
    public function index(Request $request, PostRepository $postRepository): Response
    {
        $page = (int) $request->query->get('page', 1);
        $offset = ($page - 1) * 2;
    
        $paginator = $postRepository->paginateAllOrderedByLatest($offset, 2);
        $totalPostsCount = $paginator->count();
    
        $previousPage = $page > 1 ? $page - 1 : null;
        $nextPage = ($offset + 2) < $totalPostsCount ? $page + 1 : null;
    
        return $this->json([
            'posts' => $paginator,
            'previous_page' => $previousPage,
            'next_page' => $nextPage
        ]);
    }

    #[Route('/posts', name: 'posts.create', methods: ['POST'], format: 'json')]
    public function create(Request $request, ValidatorInterface $validator, PostService $postService): Response
    {
        $data = json_decode($request->getContent(), true);
        $content = $data['content'] ?? null;

        $payload = new CreatePostPayload();
        $payload->setContent($content);

        $errors = $validator->validate($payload);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $postService->create($payload);

        return new Response('', Response::HTTP_CREATED);
    }
}