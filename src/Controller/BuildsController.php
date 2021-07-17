<?php

namespace App\Controller;

use App\Entity\Build;
use App\Repository\BuildRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use ApiPlatform\Core\Api\IriConverterInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

/**
 * @return Response
 */
class BuildsController extends AbstractController
{
  private $kernel;
  private $iriConverter;

  public function __construct(KernelInterface $kernel, IriConverterInterface $iriConverter)
  {
    $this->kernel = $kernel;
    $this->iriConverter = $iriConverter;
  }

  /**
   * @Route("/")
   */
  public function index(Request $request, BuildRepository $repo): Response
  {
    $weaponLocal = json_decode(file_get_contents($this->kernel->getProjectDir() . "/public/json/" . $request->getLocale() . "/weapon.json"));
    
    $builds = $repo->findAll();

    $builds = array_map(function($build) use ($weaponLocal){
      $build->setWeapons(array_map(function($w) use ($weaponLocal){
        try{
          $weaponKey = $this->iriConverter->getItemFromIri($w)->getWeaponKey();
          try{
            return $weaponLocal->{$weaponKey};
          }
          catch(\Throwable $th){
            return $weaponKey;
          }
        }
        catch(\Throwable $th){
          return;
        }
      }, $build->getWeapons()));

      $build->setWeapons(array_filter($build->getWeapons(), function($w){return !is_null($w);}));
      return $build;
    }, $builds);

    return $this->render("build/index.html.twig", [
      "locale" => $request->getLocale(),
      "builds" => $builds,
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
  public function show(Request $request, Build $build): Response
  {
    $views = $build->getViews();
    $build->setViews($views + 1);
    $em = $this->getDoctrine()->getManager();
    $em->flush();

    $liked = false;

    if($user = $this->getUser()){
      if($build->getLiked()->contains($user)){
        $liked = true;
      }
    }

    return $this->render("build/build.html.twig", [
      "locale" => $request->getLocale(),
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
  public function create(Request $request): Response
  {
    return $this->render("build/create.html.twig", [
      "locale" => $request->getLocale(),
    ]);
  }

  /**
   * @Route("/edit/{id}", requirements={"id"="\d+"})
   */
  public function edit(Request $request, Build $build): Response
  {
    if($build && $build->getAuthor() == $this->getUser()){
      return $this->render("build/create.html.twig", [
        "locale" => $request->getLocale(),
        "build" => $build
      ]);
    }
    throw $this->createNotFoundException();
  }
}
