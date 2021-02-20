<?php
namespace App\Controller;
use App\Entity\Builds;
use App\Repository\BuildsRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;


/**
 * @return Response
 */
class BuildsController extends AbstractController{

    private $locale;
    private $kernel;

    public function __construct(KernelInterface $kernel){
        $this->kernel = $kernel; 
    }

    /** 
    * @Route("/")
    */
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

    /**
     * @Route("/build/{id}")
     */
    public function view(Request $request, Builds $build) : Response
    {

        $this->locale = $request->getLocale();

        return $this->render('pages/build.html.twig', [
            'current_menu' => 'build',
            'locale' => $this->locale,
            'build' => $build
        ]);
    }

    /**
     * @Route("/create")
     */
    public function create(Request $request) : Response
    {
        $this->locale = $request->getLocale();

        return $this->render('pages/create.html.twig', [
            'current_menu' => 'create',
            'locale' => $this->locale,
            'weapons' => json_decode(file_get_contents($this->kernel->getProjectDir().'/public/json/'.$this->locale.'/weapon.json'))
        ]);
    }

    /**
     * @Route("/submit")
     */
    public function submit(Request $request) : Response
    {
        if($request->isXmlHttpRequest()){

            if ($content = $request->getContent()) {
                $buildObject = json_decode($content, true);
            }

            $build = new Builds();
            $build->setTitle($buildObject['title'])
            ->setDescription($buildObject['description'])
            ->setType($buildObject['type']);
            $em = $this->getDoctrine()->getManager();
            $em->persist($build);
            $em->flush();

            
            return $this->json(["id" => $build->getId()], 201); 

        }else{
            return $this->json(["message" => "Not ajax"], 403);
        }

    }

    
    /**
     * @Route("/edit/{id}")
     */
    // public function edit(Request $request, Builds $build) : Response
    // {
    //     $this->locale = $request->getLocale();

    //     return $this->render('pages/create.html.twig', [
    //         'current_menu' => 'create',
    //         'locale' => $this->locale,
    //         'weapons' => json_decode(file_get_contents($this->kernel->getProjectDir().'/public/json/'.$this->locale.'/weapon.json')),
    //         'build' => $build
    //     ]);
    // }

    /**
     * @Route("/update/{id}")
     */
    // public function update(Request $request, Builds $build) : Response
    // {
    //     if($request->isXmlHttpRequest()){


    //         if ($content = $request->getContent()) {
    //             $buildObject = json_decode($content, true);
    //         }

    //         $build->setTitle($buildObject['title'])
    //         ->setDescription($buildObject['description'])
    //         ->setType($buildObject['type']);
    //         $em = $this->getDoctrine()->getManager();
    //         $em->flush();

    //         return $this->json('ok');
    //     }else{
    //         return $this->json(["code" => 404, "message" => "Not ajax"]);
    //     }

    // }

}
?>