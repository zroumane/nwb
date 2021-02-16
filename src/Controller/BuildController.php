<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @param TranslatorInterface $translator
 * @return Response
 */
class BuildController extends AbstractController{

    private $kernel;
    private $lang;

    public function __construct(KernelInterface $kernel){
        $this->kernel = $kernel; 
    }

    public function index(Request $request) : Response
    {
        $this->lang = $request->getLocale();

        return $this->render('pages/build.html.twig', [
            'current_menu' => 'build',
            'lang' => $this->lang
        ]);
    }

}
?>