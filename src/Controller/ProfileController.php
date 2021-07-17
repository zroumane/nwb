<?php

namespace App\Controller;

use App\Entity\User;
use App\Controller\ConvertWeapon;
use App\Repository\BuildRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use ApiPlatform\Core\Api\IriConverterInterface;
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
  public function show(Request $request, User $user, IriConverterInterface $iriconverter, KernelInterface $kernel): Response
  {

    $persistentCollection = $user->getBuilds();
    $persistentCollection->initialize();
    $builds = $persistentCollection->getSnapshot();
        
    $builds = ConvertWeapon::convert($iriconverter, $kernel, $builds, $request->getLocale());

    
    return $this->render("profile/index.html.twig", [
      "user" => $user,
      "global" => false,
      "builds" => $builds,
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
