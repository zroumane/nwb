<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\RegistrationFormType;
use App\Repository\UserRepository;
use App\Security\EmailVerifier;
use App\Security\AppAuthenticator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Guard\GuardAuthenticatorHandler;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;


class SecurityController extends AbstractController
{

  private $emailVerifier;

  public function __construct(EmailVerifier $emailVerifier)
  {
    $this->emailVerifier = $emailVerifier;
  }

  /**
   * @Route("/login")
   */
  public function login(Request $request, UserPasswordEncoderInterface $passwordEncoder, AuthenticationUtils $authenticationUtils): Response
  {

    $user = new User();
    $form = $this->createForm(RegistrationFormType::class, $user);
    $form->handleRequest($request);

    if ($form->isSubmitted() && $form->isValid()) {
      // encode the plain password
      $user->setPassword(
        $passwordEncoder->encodePassword(
          $user,
          $form->get('plainPassword')->getData()
        )
      );

      $entityManager = $this->getDoctrine()->getManager();
      $entityManager->persist($user);
      $entityManager->flush();

      // generate a signed url and email it to the user
      $this->emailVerifier->sendEmailConfirmation($user);
      $this->addFlash('login.verify.nocheck', 'login.verify.nocheck');

    }

    $error = $authenticationUtils->getLastAuthenticationError();
    $lastUsername = $authenticationUtils->getLastUsername();

    return $this->render('security/login.html.twig', [
      'current_menu' => 'login',
      'locale' => $request->getLocale(),
      'registrationForm' => $form->createView(),
      'last_username' => $lastUsername,
      'error' => $error
    ]);
  }

  /**
   * @Route("/verify/email", name="app_verify_email")
   */
  public function verifyUserEmail(Request $request, UserRepository $userRepository, AppAuthenticator $authenticator, GuardAuthenticatorHandler $guardHandler): Response
  {

    $id = $request->get('id');

    if (null === $id) {
      $this->addFlash('login.verify.invalid', 'login.verify.invalid');
      return $this->redirectToRoute('app_security_login');
    }

    $user = $userRepository->find($id);

    if (null === $user) {
      $this->addFlash('login.verify.invalid', 'login.verify.invalid');
      return $this->redirectToRoute('app_security_login');
    }

    try {

      $this->emailVerifier->handleEmailConfirmation($request, $user);

    } 
    catch (VerifyEmailExceptionInterface $exception) {
      
      $this->addFlash('verify_error', $exception->getReason());
      return $this->redirectToRoute('app_security_login');

    }

    $this->addFlash('login.verify.check', 'login.verify.check');

    return $guardHandler->authenticateUserAndHandleSuccess(
      $user,
      $request,
      $authenticator,
      'main'
    );
  }

  /**
   * @Route("/logout")
   */
  public function logout()
  {
    throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
  }
}
