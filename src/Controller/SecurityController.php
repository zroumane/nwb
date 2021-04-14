<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\RegistrationFormType;
use App\Security\EmailVerifier;
use App\Security\AppAuthenticator;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mime\Address;
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
  public function login(Request $request, UserPasswordEncoderInterface $passwordEncoder, GuardAuthenticatorHandler $guardHandler, AppAuthenticator $authenticator, AuthenticationUtils $authenticationUtils): Response
  {
    // if ($this->getUser()) {
    //   return $this->redirectToRoute('app_builds_index');
    // }

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
      $this->emailVerifier->sendEmailConfirmation(
        'app_verify_email',
        $user,
        (new TemplatedEmail())
          ->from(new Address('zephyr@newworld-builder.com', 'NWB contact'))
          ->to($user->getEmail())
          ->subject('Please Confirm your Email')
          ->htmlTemplate('security/confirmation_email.html.twig')
      );
      // do anything else you need here, like send an email

      return $guardHandler->authenticateUserAndHandleSuccess(
        $user,
        $request,
        $authenticator,
        'main' // firewall name in security.yaml
      );
    }

    // $this->addFlash('verify_email_error', 'Your email address has not been verified.');
    // $this->addFlash('success', 'Your email address has been verified.');


    // get the login error if there is one
    $error = $authenticationUtils->getLastAuthenticationError();
    // last username entered by the user
    $lastUsername = $authenticationUtils->getLastUsername();

    return $this->render('security/login.html.twig', [
      'current_menu' => 'register',
      'locale' => $request->getLocale(),
      'registrationForm' => $form->createView(),
      'last_username' => $lastUsername,
      'error' => $error
    ]);
  }

  /**
   * @Route("/verify/email", name="app_verify_email")
   */
  public function verifyUserEmail(Request $request): Response
  {
    $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

    // validate email confirmation link, sets User::isVerified=true and persists
    try {
      $this->emailVerifier->handleEmailConfirmation($request, $this->getUser());
    } catch (VerifyEmailExceptionInterface $exception) {
      $this->addFlash('verify_email_error', $exception->getReason());

      return $this->redirectToRoute('app_registration_login');
    }

    // @TODO Change the redirect on success and handle or remove the flash message in your templates
    $this->addFlash('success', 'Your email address has been verified.');

    return $this->redirectToRoute('app_registration_login');
  }

  /**
   * @Route("/logout")
   */
  public function logout()
  {
    throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
  }
}
