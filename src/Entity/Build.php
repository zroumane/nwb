<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Repository\BuildRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity(repositoryClass=BuildRepository::class)
 */
#[ApiResource(
  normalizationContext: ['groups' => 'read:build'],
  denormalizationContext: ['groups' => 'write:build'],
  collectionOperations: [
    'get',
    'post' => ['security' => 'is_granted("ROLE_ADMIN")']
  ],
  itemOperations: [
    'get',
    'put' => ['security' => 'is_granted("ROLE_ADMIN")'],
    'delete' => ['security' => 'is_granted("ROLE_ADMIN")']
  ]
)]
class Build
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
   * @ORM\JoinColumn(nullable=false)
   */
  #[Groups(['read:build'])]
  private $author;

  /**
   * @ORM\ManyToMany(targetEntity=Weapon::class)
   */
  #[Groups(['read:build', 'write:build'])]
  private $weapons;

  /**
   * @ORM\Column(type="json")
   */
  #[Groups(['read:build', 'write:build'])]
  private $activeSkills = [];

  /**
   * @ORM\Column(type="array")
   */
  #[Groups(['read:build', 'write:build'])]
  private $mainSkills = [];


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

  public function getActiveSkills(): ?array
  {
    return $this->activeSkills;
  }

  public function setActiveSkills(array $activeSkills): self
  {
    $this->activeSkills = $activeSkills;

    return $this;
  }

  public function getMainSkills(): ?array
  {
      return $this->mainSkills;
  }

  public function setMainSkills(array $mainSkills): self
  {
      $this->mainSkills = $mainSkills;

      return $this;
  }
}
