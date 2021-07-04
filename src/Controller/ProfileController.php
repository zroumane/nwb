<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\EditProfileType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ProfileController extends AbstractController
{
  /**
   * @Route("/profile")
   */
  public function index(): Response
  {
    if ($this->getUser()) {
      return $this->render("profile/index.html.twig");
    } else {
      return $this->redirectToRoute("app_security_login");
    }
  }

  /**
   * @Route("/profile/{id}", requirements={"id"="\d+"})
   */
  public function profile(User $user): Response
  {
    if ($this->getUser() == $user) {
      return $this->redirectToRoute("app_profil_index");
    } else {
      return $this->render("profile/index.html.twig", [
        "user" => $user,
      ]);
    }
  }
}
