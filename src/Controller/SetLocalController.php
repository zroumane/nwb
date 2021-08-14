<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * @param String $locale
 * @return array
 */
class SetLocalController
{
  /**
   * @Route("/setlocale/{locale}")
   */
  public function index(Request $request, $locale = null)
  {
    $locale_array = ["en", "fr"];

    if (in_array($locale, $locale_array)) {
      $request->getSession()->set("_locale", $locale);
    }
    
    $url = $request->headers->get("referer");
    if (empty($url)) {
      $url = $this->container->get("router")->generate("index");
    }

    return new RedirectResponse($url);
  }
}
