<?php

namespace App\Repository;

use App\Entity\Builds;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;

/**
 * @method Builds|null find($id, $lockMode = null, $lockVersion = null)
 * @method Builds|null findOneBy(array $criteria, array $orderBy = null)
 * @method Builds[]    findAll()
 * @method Builds[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class BuildsRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Builds::class);
    }

    // /**
    //  * @return Builds[] Returns an array of Builds objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('b.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Builds
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
