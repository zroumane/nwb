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

	/**
	 * @Route("/profile/edit", name="profile_edit")
	 */
	public function edit(Request $request): Response
	{
		$user = $this->getUser();
		$form = $this->createForm(EditProfileType::class, $user);
		$form->handleRequest($request);

		if ($form->isSubmitted() && $form->isValid()) {
			$entityManager = $this->getDoctrine()->getManager();
			$entityManager->persist($user);
			$entityManager->flush();

			return $this->redirectToRoute("profile");
		}

		return $this->render("profile/edit.html.twig", [
			"form" => $form->createView(),
		]);
	}
}
