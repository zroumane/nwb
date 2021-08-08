<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Repository\ItemRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity(repositoryClass=ItemRepository::class)
 */
#[ApiResource(
	attributes: ["pagination_enabled" => false],
	collectionOperations: [
        'post' => ['security' => 'is_granted("ROLE_ADMIN")']
    ],
	itemOperations: [
        'get',
        'put' => ['security' => 'is_granted("ROLE_ADMIN")'],
        'delete' => ['security' => 'is_granted("ROLE_ADMIN")']
    ],
    subresourceOperations: [
        'api_item_categories_items_get_subresource' => [
            'method' => 'GET',
            'normalization_context' => [
                'groups' => ['read:itemCollection'],
            ],
        ],
        'api_item_tags_items_get_subresource' => [
            'method' => 'GET',
            'normalization_context' => [
                'groups' => ['read:itemCollection'],
            ],
        ],
    ],
)]
class Item
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
    #[Groups(['read:itemCollection'])]
    private $itemKey;

    /**
     * @ORM\Column(type="json")
     */
    private $craft = [];

    /**
     * @ORM\ManyToOne(targetEntity=ItemCategory::class, inversedBy="items")
     * @ORM\JoinColumn(onDelete="CASCADE")
     */
    private $category;

    /**
     * @ORM\ManyToMany(targetEntity=ItemTag::class, inversedBy="items")
     */
    private $tag;

    public function __construct()
    {
        $this->tag = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getItemKey(): ?string
    {
        return $this->itemKey;
    }

    public function setItemKey(string $itemKey): self
    {
        $this->itemKey = $itemKey;

        return $this;
    }

    public function getCraft(): ?array
    {
        return $this->craft;
    }

    public function setCraft(array $craft): self
    {
        $this->craft = $craft;

        return $this;
    }

    public function getCategory(): ?ItemCategory
    {
        return $this->category;
    }

    public function setCategory(?ItemCategory $category): self
    {
        $this->category = $category;

        return $this;
    }

    /**
     * @return Collection|ItemTag[]
     */
    public function getTag(): Collection
    {
        return $this->tag;
    }

    public function addTag(ItemTag $tag): self
    {
        if (!$this->tag->contains($tag)) {
            $this->tag[] = $tag;
        }

        return $this;
    }

    public function removeTag(ItemTag $tag): self
    {
        $this->tag->removeElement($tag);

        return $this;
    }
}
