<?php

namespace App\Controller;

use App\Entity\Build;
use App\Repository\BuildRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * @return Response
 */
class BuildsController extends AbstractController
{
  public function __construct(KernelInterface $kernel)
  {
    $this->kernel = $kernel;
  }

  /**
   * @Route("/")
   */
  public function index(Request $request, BuildRepository $repo): Response
  {
    $builds = $repo->findAll();

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

    return $this->render("build/build.html.twig", [
      "locale" => $request->getLocale(),
      "build" => $build,
    ]);
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
    if($build){
      return $this->render("build/create.html.twig", [
        "locale" => $request->getLocale(),
      ]);
    }
  }
}
