<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;


class SetLocalController extends AbstractController
{

  // public function index(Request $request, $_locale)
  // {
  //   $locale_array = ["en", "fr"];

  //   if (in_array($_locale, $locale_array)) {
  //     $request->getSession()->set("_locale", $_locale);
  //   }
    
  //   $url = $request->headers->get("referer");
  //   return new RedirectResponse($url ?? '/');
  // }

}
