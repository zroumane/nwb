<?php
namespace App\Controller;
use App\Entity\Builds;
use App\Repository\BuildsRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;


/**
 * @return Response
 */
class BuildsController extends AbstractController{

    private $locale;

    public function index(Request $request, BuildsRepository $repo) : Response
    {   

        $builds = $repo->findAll();

        $this->locale = $request->getLocale();

        return $this->render('pages/builds.html.twig', [
            'current_menu' => 'builds',
            'locale' => $this->locale,
            'builds' => $builds
        ]);
    }

    public function getBuild(Request $request, BuildsRepository $repo, $id) : Response
    {
        $build = null;

        if(is_numeric($id))
        {
            $build = $repo->findOneBy(array('id' => $id));
        }

        $this->locale = $request->getLocale();

        return $this->render('pages/build.html.twig', [
            'current_menu' => 'build',
            'locale' => $this->locale,
            'build' => $build
        ]);
    }

}
?>