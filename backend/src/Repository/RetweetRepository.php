<?php

namespace App\Repository;

use App\Entity\Retweet;
use App\Entity\User;
use App\Entity\Post;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Retweet>
 *
 * @method Retweet|null find($id, $lockMode = null, $lockVersion = null)
 * @method Retweet|null findOneBy(array $criteria, array $orderBy = null)
 * @method Retweet[]    findAll()
 * @method Retweet[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class RetweetRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Retweet::class);
    }

    /**
     * Vérifier si un utilisateur a retweeté un post spécifique
     */
    public function hasUserRetweeted(int $postId, int $userId): bool
    {
        return (bool) $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.originalPost = :postId')
            ->andWhere('r.user = :userId')
            ->setParameter('postId', $postId)
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Trouver tous les retweets d'un post spécifique
     */
    public function findByPost(int $postId): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.originalPost = :postId')
            ->setParameter('postId', $postId)
            ->orderBy('r.created_at', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Compter le nombre de retweets pour un post
     */
    public function countByPost(int $postId): int
    {
        return (int) $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.originalPost = :postId')
            ->setParameter('postId', $postId)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Trouver tous les retweets faits par un utilisateur
     */
    public function findByUser(int $userId): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('r.created_at', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouver un retweet spécifique par utilisateur et post
     */
    public function findOneByUserAndPost(int $userId, int $postId): ?Retweet
    {
        return $this->createQueryBuilder('r')
            ->where('r.user = :userId')
            ->andWhere('r.originalPost = :postId')
            ->setParameter('userId', $userId)
            ->setParameter('postId', $postId)
            ->getQuery()
            ->getOneOrNullResult();
    }
} 