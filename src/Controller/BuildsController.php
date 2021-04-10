<?php
namespace App\Controller;
use App\Entity\Build;
use App\Repository\BuildRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\RedirectResponse;


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
    public function index(Request $request, BuildRepository $repo) : Response
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
     * @Route("/build/{id}", requirements={"id"="\d+"})
     */
    public function view(Request $request, Build $build) : Response
    {

        $this->locale = $request->getLocale();

        $views = $build->getViews();
        $build->setViews($views + 1);
        $em = $this->getDoctrine()->getManager();
        $em->flush();

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
            }else {
                return $this->json(["message" => "No content"], 403);
            }

            $datetime = new \DateTime();

            $build = new Build();
            $build->setName($buildObject['name'])
                ->setDescription($buildObject['description'])
                ->setType($buildObject['type'])
                ->setWeapon($buildObject['weapon'])
                ->setSkills([])
                ->setCreatedAt($datetime)
                ->setUpdatedAt($datetime);
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
    // public function edit(Request $request, Build $build) : Response
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
    // public function update(Request $request, Build $build) : Response
    // {
    //     if($request->isXmlHttpRequest()){


    //         if ($content = $request->getContent()) {
    //             $buildObject = json_decode($content, true);
    //         }

    // $datetime = new \DateTime();

            // $build->setName($buildObject['name'])
            //     ->setDescription($buildObject['description'])
            //     ->setType($buildObject['type'])
            //     ->setWeapon($buildObject['weapon'])
            //     ->setSkills([])
            //     ->setUpdatedAt($datetime);
            // $em = $this->getDoctrine()->getManager();
            // $em->flush();

        //     return $this->json('ok');
        // }else{
        //     return $this->json(["code" => 404, "message" => "Not ajax"]);
    //     }

    // }

    /**
     * @Route("/delete/{id}")
     */
    public function delete(Request $request, Build $build) : RedirectResponse
    {
        $em = $this->getDoctrine()->getManager();
        $em->remove($build);
        $em->flush();
        return $this->redirectToRoute('app_builds_index');
    }

}
?>