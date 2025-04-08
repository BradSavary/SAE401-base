<?php

namespace App\Entity;

use App\Repository\CommentRepository;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\Post;
use App\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity(repositoryClass: CommentRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Comment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'text')]
    private string $content;

    #[ORM\ManyToOne(targetEntity: Post::class, inversedBy: 'comments')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Post $post = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'comments')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $created_at;

    #[ORM\Column(type: 'boolean')]
    private bool $is_censored = false;

    #[ORM\OneToMany(mappedBy: 'comment', targetEntity: CommentInteraction::class, cascade: ['remove'], orphanRemoval: true)]
    private Collection $interactions;

    public function __construct()
    {
        $this->created_at = new \DateTime();
        $this->interactions = new ArrayCollection();
    }

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->created_at = new \DateTime();
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

    public function getPost(): ?Post
    {
        return $this->post;
    }

    public function setPost(?Post $post): self
    {
        $this->post = $post;

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

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeInterface $created_at): self
    {
        $this->created_at = $created_at;

        return $this;
    }

    /**
     * @return Collection<int, CommentInteraction>
     */
    public function getInteractions(): Collection
    {
        return $this->interactions;
    }

    public function addInteraction(CommentInteraction $interaction): self
    {
        if (!$this->interactions->contains($interaction)) {
            $this->interactions[] = $interaction;
            $interaction->setComment($this);
        }

        return $this;
    }

    public function removeInteraction(CommentInteraction $interaction): self
    {
        if ($this->interactions->removeElement($interaction)) {
            // Set the owning side to null (unless already changed)
            if ($interaction->getComment() === $this) {
                $interaction->setComment(null);
            }
        }

        return $this;
    }

    public function isCensored(): bool
    {
        return $this->is_censored;
    }

    public function setIsCensored(bool $is_censored): self
    {
        $this->is_censored = $is_censored;
        return $this;
    }

    /**
     * Retourne le contenu du commentaire, en tenant compte de la censure si applicable
     */
    public function getContentWithCensorship(): string
    {
        if ($this->is_censored) {
            return "Ce message enfreint les conditions d'utilisation de la plateforme";
        }
        return $this->content;
    }
} 