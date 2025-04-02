<?php

namespace App\Entity;

use App\Repository\PostRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Entity\PostInteraction;

#[ORM\Entity(repositoryClass: PostRepository::class)]
class Post
{
    #[ORM\OneToMany(mappedBy: 'post', targetEntity: PostInteraction::class, cascade: ['remove'], orphanRemoval: true)]
    private Collection $interactions;

    #[ORM\OneToMany(mappedBy: 'post', targetEntity: PostMedia::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $media;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private int $id;

    #[ORM\Column(type: 'string', length: 280)]
    private string $content;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $created_at;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'posts')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, name: 'author_id', referencedColumnName: 'id')]
    private $author;

    public function __construct()
    {
        $this->interactions = new ArrayCollection();
        $this->media = new ArrayCollection();
        $this->created_at = new \DateTime();
    }

    /**
     * @return Collection<int, PostMedia>
     */
    public function getMedia(): Collection
    {
        return $this->media;
    }

    public function addMedia(PostMedia $media): static
    {
        if (!$this->media->contains($media)) {
            $this->media->add($media);
            $media->setPost($this);
        }

        return $this;
    }

    public function removeMedia(PostMedia $media): static
    {
        if ($this->media->removeElement($media)) {
            if ($media->getPost() === $this) {
                $media->setPost(null);
            }
        }

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(User $author): self
    {
        $this->author = $author;

        return $this;
    }

    /**
     * @return Collection<int, PostInteraction>
     */
    public function getInteractions(): Collection
    {
        return $this->interactions;
    }

    public function addInteraction(PostInteraction $interaction): self
    {
        if (!$this->interactions->contains($interaction)) {
            $this->interactions[] = $interaction;
            $interaction->setPost($this);
        }

        return $this;
    }

    public function removeInteraction(PostInteraction $interaction): self
    {
        if ($this->interactions->removeElement($interaction)) {
            // Set the owning side to null (unless already changed)
            if ($interaction->getPost() === $this) {
                $interaction->setPost(null);
            }
        }

        return $this;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): self
    {
        $this->content = $content;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeInterface $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Vérifie si un utilisateur a liké ce post.
     *
     * @param User $user
     * @return bool
     */
    public function isLikedByUser(User $user): bool
    {
        foreach ($this->interactions as $interaction) {
            if ($interaction->getUser() === $user && $interaction->getType() === 'like') {
                return true;
            }
        }

        return false;
    }

    public function getLikesCount(): int
    {
        $count = 0;
        foreach ($this->interactions as $interaction) {
            if ($interaction->getType() === 'like') {
                $count++;
            }
        }
        return $count;
    }
}