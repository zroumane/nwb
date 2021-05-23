<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class LocaleSubscriber implements EventSubscriberInterface
{
  private $defaultLocale;

  public function __construct(string $defaultLocale = "en")
  {
    $this->defaultLocale = $defaultLocale;
  }

  public function onKernelRequest(RequestEvent $event)
  {
    $request = $event->getRequest();
    if (!$request->hasPreviousSession()) {
      $locale = substr($_SERVER["HTTP_ACCEPT_LANGUAGE"], 0, 2);

      // $locale_array = ['de','en','es','fr','it','pl','pt'];
      $locale_array = ["en", "fr"];

      $locale = in_array($locale, $locale_array) ? $locale : $this->defaultLocale;
      $request->setLocale($locale);
      return;
    }

    if ($locale = $request->attributes->get("_locale")) {
      $request->getSession()->set("_locale", $locale);
    } else {
      $request->setLocale($request->getSession()->get("_locale", $this->defaultLocale));
    }
  }

  public static function getSubscribedEvents()
  {
    return [
      // must be registered before (i.e. with a higher priority than) the default Locale listener
      KernelEvents::REQUEST => [["onKernelRequest", 20]],
    ];
  }
}
