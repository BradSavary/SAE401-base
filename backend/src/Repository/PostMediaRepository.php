<?php

namespace App\Repository;

use App\Entity\PostMedia;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PostMedia>
 *
 * @method PostMedia|null find($id, $lockMode = null, $lockVersion = null)
 * @method PostMedia|null findOneBy(array $criteria, array $orderBy = null)
 * @method PostMedia[]    findAll()
 * @method PostMedia[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PostMediaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PostMedia::class);
    }

    public function save(PostMedia $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(PostMedia $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
} 