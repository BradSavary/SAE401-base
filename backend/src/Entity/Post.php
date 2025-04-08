<?php

namespace App\Entity;

use App\Repository\PostRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Entity\PostInteraction;
use App\Entity\Comment;

#[ORM\Entity(repositoryClass: PostRepository::class)]
class Post
{
    #[ORM\OneToMany(mappedBy: 'post', targetEntity: PostInteraction::class, cascade: ['remove'], orphanRemoval: true)]
    private Collection $interactions;

    #[ORM\OneToMany(mappedBy: 'post', targetEntity: PostMedia::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $media;

    #[ORM\OneToMany(mappedBy: 'post', targetEntity: Comment::class, cascade: ['remove'], orphanRemoval: true)]
    private Collection $comments;

    #[ORM\ManyToMany(targetEntity: Hashtag::class, inversedBy: 'posts')]
    private Collection $hashtags;

    #[ORM\OneToMany(mappedBy: 'post', targetEntity: Mention::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $mentions;

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

    #[ORM\Column(type: 'boolean')]
    private bool $is_censored = false;

    #[ORM\Column(type: 'boolean')]
    private bool $is_pinned = false;

    public function __construct()
    {
        $this->interactions = new ArrayCollection();
        $this->media = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->hashtags = new ArrayCollection();
        $this->mentions = new ArrayCollection();
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

    /**
     * @return Collection<int, Comment>
     */
    public function getComments(): Collection
    {
        return $this->comments;
    }

    public function addComment(Comment $comment): self
    {
        if (!$this->comments->contains($comment)) {
            $this->comments[] = $comment;
            $comment->setPost($this);
        }

        return $this;
    }

    public function removeComment(Comment $comment): self
    {
        if ($this->comments->removeElement($comment)) {
            // set the owning side to null (unless already changed)
            if ($comment->getPost() === $this) {
                $comment->setPost(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Hashtag>
     */
    public function getHashtags(): Collection
    {
        return $this->hashtags;
    }

    public function addHashtag(Hashtag $hashtag): static
    {
        if (!$this->hashtags->contains($hashtag)) {
            $this->hashtags->add($hashtag);
        }

        return $this;
    }

    public function removeHashtag(Hashtag $hashtag): static
    {
        $this->hashtags->removeElement($hashtag);

        return $this;
    }

    /**
     * @return Collection<int, Mention>
     */
    public function getMentions(): Collection
    {
        return $this->mentions;
    }

    public function addMention(Mention $mention): static
    {
        if (!$this->mentions->contains($mention)) {
            $this->mentions->add($mention);
            $mention->setPost($this);
        }

        return $this;
    }

    public function removeMention(Mention $mention): static
    {
        if ($this->mentions->removeElement($mention)) {
            // set the owning side to null (unless already changed)
            if ($mention->getPost() === $this) {
                $mention->setPost(null);
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
     * Retourne le contenu du post, en tenant compte de la censure si applicable
     */
    public function getContentWithCensorship(): string
    {
        if ($this->is_censored) {
            return "Ce message enfreint les conditions d'utilisation de la plateforme";
        }
        return $this->content;
    }

    public function isPinned(): bool
    {
        return $this->is_pinned;
    }

    public function setIsPinned(bool $is_pinned): self
    {
        $this->is_pinned = $is_pinned;
        return $this;
    }
}