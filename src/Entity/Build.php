<?php

namespace App\Entity;

use App\Entity\User;
use App\Entity\Weapon;
use App\Validator\ActiveSkill;
use App\Validator\SelectedSkill;
use Doctrine\ORM\Mapping as ORM;
use App\Validator\JsonArrayLenght;
use App\Repository\BuildRepository;
use App\Serializer\UserOwnedInterface;
use Doctrine\Common\Collections\Collection;
use ApiPlatform\Core\Annotation\ApiResource;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;


/**
 * @ORM\Entity(repositoryClass=BuildRepository::class)
 * @ORM\HasLifecycleCallbacks()
 */
#[ApiResource(
  normalizationContext: ['groups' => 'read:build'],
  denormalizationContext: ['groups' => 'write:build'],
  collectionOperations: [
    'get',
    'post'
  ],
  itemOperations: [
    'get',
    'put' => ['access_control' => 'is_granted("CheckUserBuild", object) or is_granted("ROLE_ADMIN")'],
    'delete' => ['access_control' => 'is_granted("CheckUserBuild", object) or is_granted("ROLE_ADMIN")']
  ]
)]
class Build implements UserOwnedInterface
{
  /**
   * @ORM\Id
   * @ORM\GeneratedValue
   * @ORM\Column(type="integer")
   */
  #[Groups(['read:build'])]
  private $id;

  /**
   * @ORM\Column(type="string", length=255)
   * @Assert\NotBlank
   */
  #[Groups(['read:build', 'write:build'])]
  private $name;

  /**
   * @ORM\Column(type="text", nullable=true)
   */
  #[Groups(['read:build', 'write:build'])]
  private $description;

  /**
   * @ORM\Column(type="integer")
   * @Assert\Range(min = 1, max = 5)
   */
  #[Groups(['read:build', 'write:build'])]
  private $type;

  /**
   * @ORM\Column(type="datetime")
   */
  #[Groups(['read:build'])]
  private $created_at;

  /**
   * @ORM\Column(type="datetime")
   */
  #[Groups(['read:build'])]
  private $updated_at;

  /**
   * @ORM\Column(type="bigint")
   */
  #[Groups(['read:build'])]
  private $views = 0;

  /**
   * @ORM\ManyToOne(targetEntity=User::class, inversedBy="builds")
   * @ORM\JoinColumn(nullable=true)
   */
  #[Groups(['read:build'])]
  private $author;

  /**
   * @ORM\ManyToMany(targetEntity=Weapon::class)
	 * @JsonArrayLenght(2)
   */
  #[Groups(['read:build', 'write:build'])]
  private $weapons;

  /**
   * @ORM\Column(type="json")
   * @JsonArrayLenght(2)
   * @SelectedSkill
   */
  #[Groups(['read:build', 'write:build'])]
  private $selectedSkills = [];

  /**
   * @ORM\Column(type="array")
   * @JsonArrayLenght(2)
   * @ActiveSkill
   */
  #[Groups(['read:build', 'write:build'])]
  private $activedSkills = [];

  /**
   * @ORM\PrePersist
   */
  public function setCreatedAtValue(): void
  {
    $this->created_at = new \DateTime("now");
    $this->updated_at = new \DateTime("now");
  }
  
  /**
   * @ORM\PreUpdate
   */
  public function setUpdateAtValue(): void
  {
    $this->updated_at = new \DateTime("now");
  }
  
  public function __construct()
  {
    $this->weapons = new ArrayCollection();
  }

  public function getId(): ?int
  {
    return $this->id;
  }

  public function getName(): ?string
  {
    return $this->name;
  }

  public function setName(string $name): self
  {
    $this->name = $name;

    return $this;
  }

  public function getDescription(): ?string
  {
    return $this->description;
  }

  public function setDescription(?string $description): self
  {
    $this->description = $description;

    return $this;
  }

  public function getType(): ?int
  {
    return $this->type;
  }

  public function setType(int $type): self
  {
    $this->type = $type;

    return $this;
  }

  public function getCreatedAt(): ?\DateTimeInterface
  {
    return $this->created_at;
  }

  public function setCreatedAt(\DateTimeInterface $created_at): self
  {
    $this->created_at = $created_at;

    return $this;
  }

  public function getUpdatedAt(): ?\DateTimeInterface
  {
    return $this->updated_at;
  }

  public function setUpdatedAt(\DateTimeInterface $updated_at): self
  {
    $this->updated_at = $updated_at;

    return $this;
  }

  public function getViews(): ?string
  {
    return $this->views;
  }

  public function setViews(string $views): self
  {
    $this->views = $views;

    return $this;
  }

  public function getAuthor(): ?User
  {
    return $this->author;
  }

  public function setAuthor(?User $author): self
  {
    $this->author = $author;

    return $this;
  }

  /**
   * @return Collection|Weapon[]
   */
  public function getWeapons(): Collection
  {
    return $this->weapons;
  }

  public function addWeapon(Weapon $weapon): self
  {
    if (!$this->weapons->contains($weapon)) {
      $this->weapons[] = $weapon;
    }

    return $this;
  }

  public function removeWeapon(Weapon $weapon): self
  {
    $this->weapons->removeElement($weapon);

    return $this;
  }

  public function getSelectedSkills(): ?array
  {
    return $this->selectedSkills;
  }

  public function setSelectedSkills(array $selectedSkills): self
  {
    $this->selectedSkills = $selectedSkills;

    return $this;
  }

  public function getActivedSkills(): ?array
  {
      return $this->activedSkills;
  }

  public function setActivedSkills(array $activedSkills): self
  {
      $this->activedSkills = $activedSkills;

      return $this;
  }
}
