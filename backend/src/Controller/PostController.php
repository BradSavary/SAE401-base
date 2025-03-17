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

final class PostController extends AbstractController
{
    #[Route('/posts', name: 'app_post', methods: ['GET'], format: 'json')]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        // Retrieve all posts from the database, ordered by creation date descending
        $posts = $entityManager->getRepository(Post::class)->findBy([], ['created_at' => 'DESC']);

        // Format the posts as an array
        $formattedPosts = array_map(function ($post) {
            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $posts);

        // Return the posts as a JSON response
        return $this->json(['posts' => $formattedPosts]);
    }

        #[Route('/posts', name: 'posts.create', methods: ['POST'], format: 'json')]
        public function create(Request $request, ValidatorInterface $validator, PostService $postService, SerializerInterface $serializer): Response
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