<?php

namespace App\Repository;

use App\Entity\PatchNote;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;

/**
 * @method PatchNote|null find($id, $lockMode = null, $lockVersion = null)
 * @method PatchNote|null findOneBy(array $criteria, array $orderBy = null)
 * @method PatchNote[]    findAll()
 * @method PatchNote[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PatchNoteRepository extends ServiceEntityRepository
{
  public function __construct(ManagerRegistry $registry)
  {
    parent::__construct($registry, PatchNote::class);
  }

  // /**
  //  * @return PatchNote[] Returns an array of PatchNote objects
  //  */
  /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('p.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

  /*
    public function findOneBySomeField($value): ?PatchNote
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
