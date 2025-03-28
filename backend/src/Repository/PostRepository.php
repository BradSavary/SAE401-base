<?php

namespace App\Repository;

use App\Entity\Post;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Tools\Pagination\Paginator;
use App\Entity\User;

/**
 * @extends ServiceEntityRepository<Post>
 */
class PostRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Post::class);
    }

    public function paginateAllOrderedByLatest($offset, $count): Paginator
{
    $query = $this->createQueryBuilder('p')
        ->orderBy('p.created_at', 'DESC')
        ->setFirstResult($offset)
        ->setMaxResults($count)
        ->getQuery()
    ;

    return new Paginator($query);
}

public function findLikedPostsByUser(User $user): array
{
    return $this->createQueryBuilder('p')
        ->join('p.likes', 'l')
        ->where('l.user = :user')
        ->setParameter('user', $user)
        ->orderBy('p.created_at', 'DESC')
        ->getQuery()
        ->getResult();
}

    //    /**
    //     * @return Post[] Returns an array of Post objects
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

    //    public function findOneBySomeField($value): ?Post
    //    {
    //        return $this->createQueryBuilder('p')
    //            ->andWhere('p.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
