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
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class UserController extends AbstractController
{
    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $entityManager, MailerInterface $mailer, ValidatorInterface $validator): Response
    {
        $data = json_decode($request->getContent(), true);
    
        // Validate email format
        $emailConstraint = new Assert\Email();
        $emailErrors = $validator->validate($data['email'], $emailConstraint);
        if (count($emailErrors) > 0) {
            return new JsonResponse(['error' => 'Invalid email format', 'code' => 'INVALID_EMAIL'], Response::HTTP_BAD_REQUEST);
        }
    
        // Check if username or email already exists
        if ($entityManager->getRepository(User::class)->findOneBy(['username' => $data['username']])) {
            return new JsonResponse(['error' => 'Username already taken', 'code' => 'USERNAME_TAKEN'], Response::HTTP_CONFLICT);
        }
        if ($entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']])) {
            return new JsonResponse(['error' => 'Email already used', 'code' => 'EMAIL_TAKEN'], Response::HTTP_CONFLICT);
        }
    
        $user = new User();
        $user->setUsername($data['username']);
        $user->setEmail($data['email']);
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);
        $user->setIsVerified(false);
        $user->setApiToken(bin2hex(random_bytes(60)));
    
        // Générer un code de confirmation
        $confirmationCode = random_int(100000, 999999);
        $user->setConfirmationCode($confirmationCode);
    
        $entityManager->persist($user);
        $entityManager->flush();
    
        $email = (new TemplatedEmail())
            ->from('no-reply@example.com')
            ->to($user->getEmail())
            ->subject('Please Confirm your Email')
            ->htmlTemplate('email/confirmation_email.html.twig')
            ->context([
                'username' => $user->getUsername(),
                'confirmation_code' => $confirmationCode,
            ]);
    
        try {
            $mailer->send($email);
        } catch (\Exception $e) {
            return new Response('User registered but email could not be sent: ' . $e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    
        return new Response('User registered', Response::HTTP_CREATED);
    }
    // #[Route('/confirm/{id}', name: 'confirm', methods: ['GET'])]
    // public function confirm(User $user, EntityManagerInterface $entityManager): Response
    // {
    //     $user->setIsVerified(true);
    //     $entityManager->flush();

    //     return new Response('Email confirmed', Response::HTTP_OK);
    // }

    #[Route('/confirm', name: 'confirm_by_code', methods: ['POST'])]
    public function confirmByCode(Request $request, EntityManagerInterface $entityManager): Response
    {
        $data = json_decode($request->getContent(), true);
        $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);

        if (!$user || $user->getConfirmationCode() !== $data['code']) {
            return new Response('Invalid confirmation code', Response::HTTP_BAD_REQUEST);
        }

        $user->setIsVerified(true);
        $user->setConfirmationCode(null); // Optionally, clear the confirmation code after successful verification
        $entityManager->flush();

        return new Response('Email confirmed', Response::HTTP_OK);
    }

    #[Route('/resend-confirmation', name: 'resend_confirmation', methods: ['POST'])]
public function resendConfirmation(Request $request, EntityManagerInterface $entityManager, MailerInterface $mailer): Response
{
    $data = json_decode($request->getContent(), true);
    $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);

    if (!$user) {
        return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
    }

    if ($user->getIsVerified()) {
        return new JsonResponse(['error' => 'User already verified'], Response::HTTP_BAD_REQUEST);
    }

    // Générer un nouveau code de confirmation
    $confirmationCode = random_int(100000, 999999);
    $user->setConfirmationCode($confirmationCode);
    $entityManager->flush();

    $email = (new TemplatedEmail())
        ->from('no-reply@example.com')
        ->to($user->getEmail())
        ->subject('Please Confirm your Email')
        ->htmlTemplate('email/confirmation_email.html.twig')
        ->context([
            'username' => $user->getUsername(),
            'confirmation_code' => $confirmationCode,
        ]);

    try {
        $mailer->send($email);
    } catch (\Exception $e) {
        return new JsonResponse(['error' => 'Email could not be sent: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    return new JsonResponse(['status' => 'Confirmation email resent'], Response::HTTP_OK);
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

    // Generate a new token
    $token = bin2hex(random_bytes(32));
    $user->setApiToken($token);
    $entityManager->flush();

    return new JsonResponse([
        'message' => 'User is logged in',
        'api_token' => $token,
        'username' => $user->getUsername(),
        'email' => $user->getEmail(),
        'user_id' => $user->getId()
    ], Response::HTTP_OK);
}

    #[Route('/user/update/{id}', name: 'user_update', methods: ['PUT'])]
    #[IsGranted("ROLE_USER")]
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

    #[Route('/api/check-admin', name: 'check_admin', methods: ['POST'])]
public function checkAdmin(Request $request, EntityManagerInterface $entityManager): Response
{
    $data = json_decode($request->getContent(), true);
    $apiToken = $data['api_token'] ?? null;

    if (!$apiToken) {
        return new JsonResponse(['error' => 'API token is required'], Response::HTTP_BAD_REQUEST);
    }

    $user = $entityManager->getRepository(User::class)->findOneBy(['apiToken' => $apiToken]);

    if (!$user) {
        return new JsonResponse(['error' => 'Invalid API token'], Response::HTTP_UNAUTHORIZED);
    }

    if (in_array('ROLE_ADMIN', $user->getRoles())) {
        return new JsonResponse(['is_admin' => true], Response::HTTP_OK);
    }

    return new JsonResponse(['is_admin' => false], Response::HTTP_OK);
}
    
#[Route('/api/users', name: 'api_users', methods: ['GET'])]
public function getUsers(EntityManagerInterface $entityManager): Response
{
    $users = $entityManager->getRepository(User::class)->findAll();
    $userData = [];

    foreach ($users as $user) {
        $userData[] = [
            'username' => $user->getUsername(),
            'user_id' => $user->getId(),
            'email' => $user->getEmail(),
            'is_verified' => $user->getIsVerified(),
        ];
    }

    return new JsonResponse($userData, Response::HTTP_OK);
}

#[Route('/api/users/{id}', name: 'api_user', methods: ['GET'])]
public function getUserById(int $id, EntityManagerInterface $entityManager): Response
{
    $user = $entityManager->getRepository(User::class)->find($id);

    if (!$user) {
        return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
    }

    return new JsonResponse([
        'username' => $user->getUsername(),
        'user_id' => $user->getId(),
        'email' => $user->getEmail(),
        'is_verified' => $user->getIsVerified(),
    ], Response::HTTP_OK);

}

#[Route('/user/{id}', name: 'get_user', methods: ['GET'])]
public function fetchUserById(int $id, EntityManagerInterface $entityManager): Response
{
    $user = $entityManager->getRepository(User::class)->find($id);

    if (!$user) {
        return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
    }

    return new JsonResponse([
        'user_id' => $user->getId(),
        'username' => $user->getUsername(),
        'email' => $user->getEmail(),
        'avatar' => $user->getAvatar(),
        'place' => $user->getPlace(),
        'banner' => $user->getBanner(),
        'link' => $user->getLink(),
        'bio' => $user->getBio(),
    ], Response::HTTP_OK);
}
};