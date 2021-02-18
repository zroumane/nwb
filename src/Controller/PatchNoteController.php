<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

/**
 * @return Response
 */
class PatchNoteController extends AbstractController{

    public function index(Request $request) : Response
    {
        $locale = $request->getLocale();

        return $this->render('pages/patch.html.twig', [
            'current_menu' => 'patchnote',
            'locale' => $locale
        ]);
    }

}
?>