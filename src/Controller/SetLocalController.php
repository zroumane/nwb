<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * @param String $locale
 * @return array
 */
class SetLocalController{
    
    public function index(Request $request, $locale = null)
    {
        if(in_array($locale, ['de','en','es','fr','it','pl','pt']))
        {
            // On enregistre la langue en session
            $request->getSession()->set('_locale', $locale);
        }
    
        // on tente de rediriger vers la page d'origine
        $url = $request->headers->get('referer');
        if(empty($url))
        {
            $url = $this->container->get('router')->generate('index');
        }
    
        return new RedirectResponse($url);
    }

}
?>