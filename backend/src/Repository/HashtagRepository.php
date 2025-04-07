<?php

namespace App\Repository;

use App\Entity\Hashtag;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Hashtag>
 *
 * @method Hashtag|null find($id, $lockMode = null, $lockVersion = null)
 * @method Hashtag|null findOneBy(array $criteria, array $orderBy = null)
 * @method Hashtag[]    findAll()
 * @method Hashtag[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class HashtagRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Hashtag::class);
    }

    /**
     * Recherche les hashtags commençant par un terme donné
     */
    public function findBySearchTerm(string $term, int $limit = 20): array
    {
        return $this->createQueryBuilder('h')
            ->where('h.name LIKE :term')
            ->setParameter('term', $term . '%')
            ->orderBy('h.name', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Recherche un hashtag par son nom exact
     */
    public function findByName(string $name): ?Hashtag
    {
        return $this->findOneBy(['name' => $name]);
    }

    /**
     * Récupère les hashtags les plus populaires
     */
    public function findMostPopular(int $limit = 10): array
    {
        return $this->createQueryBuilder('h')
            ->select('h', 'COUNT(p.id) as postCount')
            ->leftJoin('h.posts', 'p')
            ->groupBy('h.id')
            ->orderBy('postCount', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
} 