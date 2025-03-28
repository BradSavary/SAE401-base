<?php

namespace App\Repository;

use App\Entity\PostInteraction;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use App\Entity\User;

/**
 * @extends ServiceEntityRepository<PostInteraction>
 */
class PostInteractionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PostInteraction::class);
    }
    public function hasUserLikedPost(int $postId, int $userId): bool
{
    return (bool) $this->createQueryBuilder('pi')
        ->select('count(pi.id)')
        ->where('pi.post = :postId')
        ->andWhere('pi.user = :userId')
        ->andWhere('pi.type = :type')
        ->setParameter('postId', $postId)
        ->setParameter('userId', $userId)
        ->setParameter('type', 'like')
        ->getQuery()
        ->getSingleScalarResult();
}

public function findLikedPostsByUser(User $user): array
{
    return $this->createQueryBuilder('pi')
        ->join('pi.post', 'p')
        ->where('pi.user = :user')
        ->andWhere('pi.type = :type')
        ->setParameter('user', $user)
        ->setParameter('type', 'like')
        ->orderBy('p.created_at', 'DESC')
        ->getQuery()
        ->getResult();
}

//    /**
//     * @return PostInteraction[] Returns an array of PostInteraction objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('p')
//            ->andWhere('p.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('p.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?PostInteraction
//    {
//        return $this->createQueryBuilder('p')
//            ->andWhere('p.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
