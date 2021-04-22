<?php

namespace App\Controller;

use App\Entity\PatchNote;
use App\Form\PatchNoteType;
use App\Repository\PatchNoteRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class PatchNoteController extends AbstractController
{
  /**
   * @Route("/patchnote", methods={"GET"})
   */
  public function index(PatchNoteRepository $patchNoteRepository): Response
  {
    return $this->render('patchnote/index.html.twig', [
      'patchnotes' => $patchNoteRepository->findBy(array(), array('id' => 'DESC')),
    ]);
  }

  /**
   * @Route("/patchnote/{id}", methods={"GET"})
   */
  public function show(PatchNote $patchNote): Response
  {
    return $this->render('patchnote/show.html.twig', [
      'patchnote' => $patchNote,
    ]);
  }

  /**
   * @Route("/admin/patchnote")
   */
  public function admin(PatchNoteRepository $patchNoteRepository): Response
  {
    return $this->render('patchnote/admin.html.twig', [
      'patchnotes' => $patchNoteRepository->findAll(),
    ]);
  }

  /**
   * @Route("/admin/patchnote/new", methods={"GET","POST"})
   */
  public function new(Request $request): Response
  {
    $patchNote = new PatchNote();
    $form = $this->createForm(PatchNoteType::class, $patchNote);
    $form->handleRequest($request);

    if ($form->isSubmitted() && $form->isValid()) {
      $entityManager = $this->getDoctrine()->getManager();
      $entityManager->persist($patchNote);
      $entityManager->flush();

      return $this->redirectToRoute('app_patchnote_admin');
    }

    return $this->render('patchnote/new.html.twig', [
      'patchnote' => $patchNote,
      'form' => $form->createView(),
    ]);
  }

  /**
   * @Route("/admin/patchnote/edit/{id}", methods={"GET","POST"})
   */
  public function edit(Request $request, PatchNote $patchNote): Response
  {
    $form = $this->createForm(PatchNoteType::class, $patchNote);
    $form->handleRequest($request);

    if ($form->isSubmitted() && $form->isValid()) {
      $this->getDoctrine()->getManager()->flush();

      return $this->redirectToRoute('app_patchnote_admin');
    }

    return $this->render('patchnote/edit.html.twig', [
      'patchnote' => $patchNote,
      'form' => $form->createView(),
    ]);
  }

  /**
   * @Route("/admin/patchnote/delete/{id}", methods={"POST"})
   */
  public function delete(Request $request, PatchNote $patchNote): Response
  {
    if ($this->isCsrfTokenValid('delete' . $patchNote->getId(), $request->request->get('_token'))) {
      $entityManager = $this->getDoctrine()->getManager();
      $entityManager->remove($patchNote);
      $entityManager->flush();
    }

    return $this->redirectToRoute('app_patchnote_admin');
  }
}
