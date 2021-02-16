<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

/**
 * @return Response
 */
class BuildController extends AbstractController{

    private $kernel;
    private $locale;

    public function __construct(KernelInterface $kernel){
        $this->kernel = $kernel; 
    }

    public function index(Request $request) : Response
    {
        $this->locale = $request->getLocale();

        return $this->render('pages/build.html.twig', [
            'current_menu' => 'build',
            'locale' => $this->locale
        ]);
    }

}
?>