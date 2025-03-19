<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Mime\Message;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class UserController extends AbstractController
{
    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $entityManager, MailerInterface $mailer): Response
    {
        $data = json_decode($request->getContent(), true);

        $user = new User();
        $user->setUsername($data['username']);
        $user->setEmail($data['email']);
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);
        $user->setIsVerified(false);
        $user->setApiToken(bin2hex(random_bytes(60)));

        $entityManager->persist($user);
        $entityManager->flush();

        $email = (new Email())
            ->from('no-reply@example.com')
            ->to($user->getEmail())
            ->subject('Please Confirm your Email')
            ->html('<p>Click <a href="http://localhost:8080/confirm/'.$user->getId().'">here</a> to confirm your email.</p>');

        $mailer->send($email);

        return new Response('User registered', Response::HTTP_CREATED);
    }

    #[Route('/confirm/{id}', name: 'confirm', methods: ['GET'])]
    public function confirm(User $user, EntityManagerInterface $entityManager): Response
    {
        $user->setIsVerified(true);
        $entityManager->flush();

        return new Response('Email confirmed', Response::HTTP_OK);
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $entityManager): Response
    {
        $data = json_decode($request->getContent(), true);
        $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);

        if (!$user || !$passwordHasher->isPasswordValid($user, $data['password'])) {
            return new Response('Invalid credentials', Response::HTTP_UNAUTHORIZED);
        }

        if (!$user->getIsVerified()) {
            return new Response('Email not verified', Response::HTTP_FORBIDDEN);
        }

        return new JsonResponse([ 'message' => 'User is logged in']);
    }

    #[Route('/user/update/{id}', name: 'user_update', methods: ['PUT'])]
public function updateUser(int $id, Request $request, EntityManagerInterface $entityManager): Response
{
    $data = json_decode($request->getContent(), true);
    $user = $entityManager->getRepository(User::class)->find($id);

    if (!$user) {
        throw new AccessDeniedException('User not found.');
    }

    if (isset($data['username'])) {
        $user->setUsername($data['username']);
    }

    if (isset($data['email'])) {
        $user->setEmail($data['email']);
    }

    $entityManager->flush();

    return new Response('User updated successfully', Response::HTTP_OK);
}

    #[Route('/api/user', 'api_user', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function me(): Response
    {
        return $this->json($this->getUser());
    }
}