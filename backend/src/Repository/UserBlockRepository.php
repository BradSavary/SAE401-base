<?php

namespace App\Repository;

use App\Entity\User;
use App\Entity\UserBlock;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserBlock>
 */
class UserBlockRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserBlock::class);
    }

    /**
     * Check if a user is blocked by another user
     */
    public function isBlocked(User $blocker, User $blocked): bool
    {
        return null !== $this->findOneBy([
            'blocker' => $blocker,
            'blocked' => $blocked,
        ]);
    }

    /**
     * Find all users blocked by a given user
     */
    public function findBlockedUsers(User $user): array
    {
        return $this->createQueryBuilder('ub')
            ->andWhere('ub.blocker = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find all users who blocked a given user
     */
    public function findBlockerUsers(User $user): array
    {
        return $this->createQueryBuilder('ub')
            ->andWhere('ub.blocked = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }
} 