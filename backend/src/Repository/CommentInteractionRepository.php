<?php

namespace App\Repository;

use App\Entity\CommentInteraction;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CommentInteraction>
 */
class CommentInteractionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CommentInteraction::class);
    }

    public function findInteractionByUserAndComment(int $userId, int $commentId): ?CommentInteraction
    {
        return $this->createQueryBuilder('ci')
            ->andWhere('ci.user = :userId')
            ->andWhere('ci.comment = :commentId')
            ->andWhere('ci.type = :type')
            ->setParameter('userId', $userId)
            ->setParameter('commentId', $commentId)
            ->setParameter('type', 'like')
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function countLikesByComment(int $commentId): int
    {
        return $this->createQueryBuilder('ci')
            ->select('COUNT(ci.id)')
            ->andWhere('ci.comment = :commentId')
            ->andWhere('ci.type = :type')
            ->setParameter('commentId', $commentId)
            ->setParameter('type', 'like')
            ->getQuery()
            ->getSingleScalarResult();
    }
} 