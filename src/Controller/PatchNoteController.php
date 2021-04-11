<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;


/**
 * @return Response
 */
class PatchNoteController extends AbstractController{

    /** 
    * @Route("/patchnote")
    */
    public function index(Request $request) : Response
    {

        return $this->render('pages/patch.html.twig', [
            'current_menu' => 'patchnote',
            'locale' => $request->getLocale()
        ]);
    }

}
?>