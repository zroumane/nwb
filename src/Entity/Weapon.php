<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Repository\WeaponRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ApiResource()
 * @ORM\Entity(repositoryClass=WeaponRepository::class)
 */
class Weapon
{
	/**
	 * @ORM\Id
	 * @ORM\GeneratedValue
	 * @ORM\Column(type="integer")
	 */
	private $id;

	/**
	 * @ORM\Column(type="string", length=255)
	 */
	private $weaponKey;

	/**
	 * @ORM\OneToMany(targetEntity=Skill::class, mappedBy="weapon")
	 */
	private $skills;

	/**
	 * @ORM\Column(type="json")
	 */
	private $branch = [];

	public function __construct()
	{
		$this->skills1 = new ArrayCollection();
		$this->skills = new ArrayCollection();
	}

	public function getId(): ?int
	{
		return $this->id;
	}

	public function getWeaponKey(): ?string
	{
		return $this->weaponKey;
	}

	public function setWeaponKey(string $weaponKey): self
	{
		$this->weaponKey = $weaponKey;

		return $this;
	}

	/**
	 * @return Collection|Skill[]
	 */
	public function getSkills(): Collection
	{
		return $this->skills;
	}

	public function addSkill(Skill $skill): self
	{
		if (!$this->skills->contains($skill)) {
			$this->skills[] = $skill;
			$skill->setWeapon($this);
		}

		return $this;
	}

	public function removeSkill(Skill $skill): self
	{
		if ($this->skills->removeElement($skill)) {
			// set the owning side to null (unless already changed)
			if ($skill->getWeapon() === $this) {
				$skill->setWeapon(null);
			}
		}

		return $this;
	}

	public function getBranch(): ?array
	{
		return $this->branch;
	}

	public function setBranch(array $branch): self
	{
		$this->branch = $branch;

		return $this;
	}
}
