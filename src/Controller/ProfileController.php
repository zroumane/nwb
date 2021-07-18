<?php

namespace App\Controller;

use App\Entity\User;
use App\Controller\ConvertWeapon;
use App\Repository\BuildRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use ApiPlatform\Core\Api\IriConverterInterface;
use App\Repository\WeaponRepository;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class ProfileController extends AbstractController
{
  /**
   * @Route("/profile")
   */
  public function index(): Response
  {
    if($user = $this->getUser()){
      return $this->redirectToRoute('app_profile_show', ['id' => $user->getId()]);
    }else{
      return $this->redirectToRoute('app_security_login');
    }
  }

    /**
   * @Route("/settings")
   */
  public function settings(): Response
  {
    if ($this->getUser()) {
      return $this->render("profile/settings.html.twig");
    } else {
      return $this->redirectToRoute("app_security_login");
    }
  }

  /**
   * @Route("/profile/{id}", requirements={"id"="\d+"})
   */
  public function show(Request $request, User $user, BuildRepository $buildRep, KernelInterface $kernel, PaginatorInterface $paginator, WeaponRepository $weaponRep): Response
  {

    $query = $buildRep->findAllQuery($request->query, $user);
    $builds = $paginator->paginate($query, $request->query->get('p') ?? 1, 20);
    $parser = new EntityParser($kernel);
    $parser->setWeaponLocal($request->getLocale());
    $parser->setWeapons($weaponRep->findAll());
    $builds->setItems(array_map(fn($build) => $parser->parseBuild($build), (array)$builds->getItems()));

    return $this->render("build/index.html.twig", [
      "user" => $user,
      "builds" => $builds,
      "weapons" => $parser->getWeapons()
    ]);
  }

  /**
   * @Route("/admin/profile")
   */
  public function admin(): Response
  {
    return $this->render("profile/admin.html.twig");
  }
}
