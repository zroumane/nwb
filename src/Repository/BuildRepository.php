<?php

namespace App\Repository;

use ApiPlatform\Core\Bridge\Doctrine\MongoDbOdm\Paginator;
use ApiPlatform\Core\DataProvider\PaginatorInterface;
use App\Entity\Build;
use App\Entity\User;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;

/**
 * @method Build|null find($id, $lockMode = null, $lockVersion = null)
 * @method Build|null findOneBy(array $criteria, array $orderBy = null)
 * @method Build[]    findAll()
 * @method Build[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class BuildRepository extends ServiceEntityRepository
{
  public function __construct(ManagerRegistry $registry)
  {
    parent::__construct($registry, Build::class);
  }


  public function findAllQuery($query, $user = null): Query
  {
    $q = $this->createQueryBuilder('b')
      ->select('b.id, b.name, b.description ,b.type ,b.weapons ,b.updated_at as d,b.views as v')
      ->addOrderBy('b.updated_at', 'DESC')
      ->leftJoin('b.author', 'a')
      ->addSelect('a.pseudo, a.id as author_id')
      ->leftJoin('b.liked', 'likes')
      ->addSelect('COUNT(likes.id) AS l')
      ->groupBy('b.id');

    $type = $query->get('t');
    if(0 < $type && $type <= 5){
      $q->where('b.type = :type')
        ->setParameter('type', $type);
    }

    $w = explode(',', $query->get('w'));
    $weapons = [$w[0] ?? null, $w[1] ?? null];
    for ($i = 0; $i <= 1 ; $i++) {
      if(is_numeric($weapons[$i])){
        $q->andWhere('b.weapons Like :weapon'.$i)
        ->setParameter('weapon'.$i, '%"/api/weapons/'.$weapons[$i].'"%');
      }
    }

    // $weapons = explode(',', $query->get('w'));
    // foreach ($weapons as $key => $id) {
    //   if(is_numeric($id)){
    //     $q->andWhere('b.weapons Like :weapon')
    //     ->setParameter('weapon', '%"/api/weapons/'.$id.'"%');
    //   }
    // }

    if($user){
      $q->andWhere('b.author = :userid')
      ->setParameter('userid', $user->getId());
    }


    // if($search = $query->get('s')){
    //   //TODO Serach Engine
    // }

    return $q->getQuery();


  }

  // /**
  //  * @return Build[] Returns an array of Build objects
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
    public function findOneBySomeField($value): ?Build
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
