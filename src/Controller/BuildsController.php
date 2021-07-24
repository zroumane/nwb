<?php

namespace App\Controller;

use App\Entity\Build;
use App\Entity\EntityParser;
use App\Repository\BuildRepository;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Repository\WeaponRepository;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

/**
 * @return Response
 */
class BuildsController extends AbstractController
{

  /**
   * @Route("/")
   */
  public function index(Request $request, PaginatorInterface $paginator, BuildRepository $buildRep, WeaponRepository $weaponRep, KernelInterface $kernel): Response
  {

    $query = $buildRep->findAllQuery($request->query);
    $builds = $paginator->paginate($query, $request->query->get('p') ?? 1, 20);

    $parser = new EntityParser($kernel);
    $parser->setWeaponLocal($request->getLocale());
    $parser->setWeapons($weaponRep->findAll());
    $builds->setItems(array_map(fn($build) => $parser->parseBuild($build), (array)$builds->getItems()));
    return $this->render("build/index.html.twig", [
      "builds" => $builds,
      "weapons" => $parser->getWeapons()
    ]);

  }

  /**
   * @Route("/admin/weapon")
   */
  public function weapon(): Response
  {
    return $this->render("build/weapon.html.twig");
  }

  /**
   * @Route("/admin/build")
   */
  public function admin(): Response
  {
    return $this->render("build/admin.html.twig");
  }

  /**
   * @Route("/build/{id}", requirements={"id"="\d+"})
   */
  public function show(Build $build): Response
  {
    $views = $build->getViews();
    $build->setViews($views + 1);
    $build->setIsViewEdit(true);
    $em = $this->getDoctrine()->getManager();
    $em->flush();

    $liked = false;

    if($user = $this->getUser()){
      if($user->getLiked()->contains($build)){
        $liked = true;
      }
    }

    return $this->render("build/build.html.twig", [
      "build" => $build,
      "liked" => $liked
    ]);
  }


  /**
   * @Route("/build/{id}/like", requirements={"id"="\d+"})
   */
  public function like(Build $build): Response
  {
    if($user = $this->getUser()){
      $build->addLiked($user);
      $em = $this->getDoctrine()->getManager();
      $em->flush();
    }

    return $this->redirectToRoute('app_builds_show', ['id' => $build->getId()]);
  }

  /**
   * @Route("/build/{id}/dislike", requirements={"id"="\d+"})
   */
  public function dislike(Build $build): Response
  {
    if($user = $this->getUser()){
      $build->removeLiked($user);
      $em = $this->getDoctrine()->getManager();
      $em->flush();
    }

    return $this->redirectToRoute('app_builds_show', ['id' => $build->getId()]);
  }

  /**
   * @Route("/create")
   */
  public function create(): Response
  {
    return $this->render("build/create.html.twig");
  }

  /**
   * @Route("/edit/{id}", requirements={"id"="\d+"})
   */
  public function edit(Build $build): Response
  {
    if($build && $build->getAuthor() == $this->getUser()){
      return $this->render("build/create.html.twig", [
        "build" => $build
      ]);
    }
    throw $this->createNotFoundException();
  }

  /**
   * @Route("/delete/{id}", requirements={"id"="\d+"})
   */
  public function delete(Build $build): Response
  {
    if($build && $build->getAuthor() == $this->getUser()){
      $em = $this->getDoctrine()->getManager();
			$em->remove($build);
			$em->flush();
      return $this->redirectToRoute('app_profile_index');
    }
  }
}
