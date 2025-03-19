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

    #[Route('/posts', name: 'posts.create', methods: ['POST'], format: 'json')]
    public function create(Request $request, EntityManagerInterface $entityManager): Response
    {
        $data = json_decode($request->getContent(), true);

        $post = new Post();
        $post->setUser($data['user']);
        $post->setContent($data['content']);
        $post->setCreatedAt(new \DateTime());

        $user = $this->getUser();
        $post->setUser($user);

        $entityManager->persist($post);
        $entityManager->flush();

        return new JsonResponse(['status' => 'Post created!'], Response::HTTP_CREATED);
    }
}