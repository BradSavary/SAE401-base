<?php

namespace App\Repository;

use App\Entity\Post;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Tools\Pagination\Paginator;
use App\Entity\User;

/**
 * @extends ServiceEntityRepository<Post>
 *
 * @method Post|null find($id, $lockMode = null, $lockVersion = null)
 * @method Post|null findOneBy(array $criteria, array $orderBy = null)
 * @method Post[]    findAll()
 * @method Post[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
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

    /**
     * Recherche des posts par leur contenu
     */
    public function findByContentLike(string $search): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.content LIKE :search')
            ->setParameter('search', '%' . $search . '%')
            ->orderBy('p.created_at', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve les posts par contenu (recherche textuelle)
     */
    public function findPostsByContent(string $query): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.content LIKE :query')
            ->setParameter('query', '%' . $query . '%')
            ->orderBy('p.created_at', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve les posts qui mentionnent un utilisateur spécifique
     */
    public function findPostsWithMention(string $username): array
    {
        return $this->createQueryBuilder('p')
            ->join('p.mentions', 'm')
            ->join('m.mentionedUser', 'u')
            ->where('u.username = :username')
            ->setParameter('username', $username)
            ->orderBy('p.created_at', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve les posts qui contiennent un hashtag spécifique
     */
    public function findPostsWithHashtag(string $hashtag): array
    {
        return $this->createQueryBuilder('p')
            ->join('p.hashtags', 'h')
            ->where('h.name = :hashtag')
            ->setParameter('hashtag', $hashtag)
            ->orderBy('p.created_at', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Recherche avancée avec filtres
     */
    public function findByFilters(
        ?string $query = null, 
        ?string $hashtag = null,
        ?string $mention = null,
        ?\DateTime $startDate = null,
        ?\DateTime $endDate = null,
        ?int $userId = null,
        int $limit = 20,
        int $offset = 0
    ): array {
        $qb = $this->createQueryBuilder('p');
        
        // Condition pour le contenu textuel
        if ($query) {
            $qb->andWhere('p.content LIKE :query')
               ->setParameter('query', '%' . $query . '%');
        }
        
        // Condition pour les hashtags
        if ($hashtag) {
            $qb->join('p.hashtags', 'h')
               ->andWhere('h.name = :hashtag')
               ->setParameter('hashtag', $hashtag);
        }
        
        // Condition pour les mentions
        if ($mention) {
            $qb->join('p.mentions', 'm')
               ->join('m.mentionedUser', 'u')
               ->andWhere('u.username = :username')
               ->setParameter('username', $mention);
        }
        
        // Condition pour la date de début
        if ($startDate) {
            $qb->andWhere('p.created_at >= :startDate')
               ->setParameter('startDate', $startDate);
        }
        
        // Condition pour la date de fin
        if ($endDate) {
            $qb->andWhere('p.created_at <= :endDate')
               ->setParameter('endDate', $endDate);
        }
        
        // Condition pour l'auteur
        if ($userId) {
            $qb->andWhere('p.user = :userId')
               ->setParameter('userId', $userId);
        }
        
        // Ordre de tri et pagination
        $qb->orderBy('p.created_at', 'DESC')
           ->setMaxResults($limit)
           ->setFirstResult($offset);
        
        return $qb->getQuery()->getResult();
    }

    /**
     * Compte le nombre de posts correspondant aux filtres
     */
    public function countByFilters(
        ?string $query = null, 
        ?string $hashtag = null,
        ?string $mention = null,
        ?\DateTime $startDate = null,
        ?\DateTime $endDate = null,
        ?int $userId = null
    ): int {
        $qb = $this->createQueryBuilder('p')
            ->select('COUNT(p.id)');
        
        // Condition pour le contenu textuel
        if ($query) {
            $qb->andWhere('p.content LIKE :query')
               ->setParameter('query', '%' . $query . '%');
        }
        
        // Condition pour les hashtags
        if ($hashtag) {
            $qb->join('p.hashtags', 'h')
               ->andWhere('h.name = :hashtag')
               ->setParameter('hashtag', $hashtag);
        }
        
        // Condition pour les mentions
        if ($mention) {
            $qb->join('p.mentions', 'm')
               ->join('m.mentionedUser', 'u')
               ->andWhere('u.username = :username')
               ->setParameter('username', $mention);
        }
        
        // Condition pour la date de début
        if ($startDate) {
            $qb->andWhere('p.created_at >= :startDate')
               ->setParameter('startDate', $startDate);
        }
        
        // Condition pour la date de fin
        if ($endDate) {
            $qb->andWhere('p.created_at <= :endDate')
               ->setParameter('endDate', $endDate);
        }
        
        // Condition pour l'auteur
        if ($userId) {
            $qb->andWhere('p.user = :userId')
               ->setParameter('userId', $userId);
        }
        
        return (int) $qb->getQuery()->getSingleScalarResult();
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
