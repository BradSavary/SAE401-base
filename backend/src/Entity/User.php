<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Entity\Comment;


#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\OneToMany(mappedBy: 'subscriber', targetEntity: Subscription::class)]
private Collection $subscriptions;

#[ORM\OneToMany(mappedBy: 'subscribedTo', targetEntity: Subscription::class)]
private Collection $subscribers;
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Email]
    private ?string $email = null;

    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 50)]
    private ?string $username = null;

    #[ORM\Column(type: 'boolean')]
    private $isVerified = false;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Post::class, orphanRemoval: true)]
    private Collection $posts;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Comment::class, orphanRemoval: true)]
    private Collection $comments;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $apiToken = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $confirmationCode = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $bio = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $avatar = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $place = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $banner = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $link = null;

    #[ORM\Column(type: 'boolean')]
    private bool $isBlocked = false;

    #[ORM\Column(type: 'boolean')]
    private bool $isReadOnly = false;

    /**
     * @var Collection<int, UserBlock> Les utilisateurs que cet utilisateur a bloqués
     */
    #[ORM\OneToMany(mappedBy: 'blocker', targetEntity: UserBlock::class, orphanRemoval: true)]
    private Collection $blockedUsers;

    /**
     * @var Collection<int, UserBlock> Les utilisateurs qui ont bloqué cet utilisateur
     */
    #[ORM\OneToMany(mappedBy: 'blocked', targetEntity: UserBlock::class, orphanRemoval: true)]
    private Collection $blockerUsers;

    public function getConfirmationCode(): ?int
    {
        return $this->confirmationCode;
    }

    public function setConfirmationCode(?int $confirmationCode): self
    {
        $this->confirmationCode = $confirmationCode;

        return $this;
    }

    public function __construct()
    {
        $this->posts = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->subscriptions = new ArrayCollection();
        $this->subscribers = new ArrayCollection();
        $this->blockedUsers = new ArrayCollection();
        $this->blockerUsers = new ArrayCollection();
        $this->roles = ['ROLE_USER'];
    }

    public function getSubscriptions(): Collection
    {
        return $this->subscriptions;
    }
    
    public function getSubscribers(): Collection
    {
        return $this->subscribers;
    }

    public function getIsVerified(): bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): self
    {
        $this->isVerified = $isVerified;

        return $this;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }
   
    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
       $this->username = $username;
       return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     *
     * @return list<string>
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }


    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

     /**
     * @return Collection<int, Post>
     */
    public function getPosts(): Collection
    {
        return $this->posts;
    }

    public function addPost(Post $post): self
    {
        if (!$this->posts->contains($post)) {
            $this->posts->add($post);
            $post->setUser($this);
        }

        return $this;
    }

    public function removePost(Post $post): self
    {
        if ($this->posts->removeElement($post)) {
            // set the owning side to null (unless already changed)
            if ($post->getUser() === $this) {
                $post->setUser(null);
            }
        }

        return $this;
    }

    public function getApiToken(): ?string
    {
        return $this->apiToken;
    }

    public function setApiToken(?string $apiToken): static
    {
        $this->apiToken = $apiToken;

        return $this;
    }

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function setBio(?string $bio): static
    {
        $this->bio = $bio;

        return $this;
    }


    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(?string $avatar): self
    {
        $this->avatar = $avatar;
        return $this;
    }

    public function getPlace(): ?string
    {
        return $this->place;
    }

    public function setPlace(?string $place): static
    {
        $this->place = $place;

        return $this;
    }

    public function getBanner(): ?string
    {
        return $this->banner;
    }

    public function setBanner(?string $banner): static
    {
        $this->banner = $banner;

        return $this;
    }

    public function getLink(): ?string
    {
        return $this->link;
    }

    public function setLink(?string $link): static
    {
        $this->link = $link;

        return $this;
    }

    public function getIsBlocked(): ?bool
    {
        return $this->isBlocked;
    }
    
    public function setIsBlocked(bool $isBlocked): static
    {
        $this->isBlocked = $isBlocked;
        return $this;
    }

    public function getIsReadOnly(): bool
    {
        return $this->isReadOnly;
    }
    
    public function setIsReadOnly(bool $isReadOnly): static
    {
        $this->isReadOnly = $isReadOnly;
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
            $comment->setUser($this);
        }

        return $this;
    }

    public function removeComment(Comment $comment): self
    {
        if ($this->comments->removeElement($comment)) {
            // set the owning side to null (unless already changed)
            if ($comment->getUser() === $this) {
                $comment->setUser(null);
            }
        }

        return $this;
    }

    /**
     * Vérifie si cet utilisateur a bloqué un autre utilisateur.
     */
    public function hasBlocked(User $user): bool
    {
        foreach ($this->blockedUsers as $userBlock) {
            if ($userBlock->getBlocked() === $user) {
                return true;
            }
        }
        return false;
    }

    /**
     * Vérifie si cet utilisateur est bloqué par un autre utilisateur.
     */
    public function isBlockedBy(User $user): bool
    {
        foreach ($this->blockerUsers as $userBlock) {
            if ($userBlock->getBlocker() === $user) {
                return true;
            }
        }
        return false;
    }

    /**
     * @return Collection<int, UserBlock>
     */
    public function getBlockedUsers(): Collection
    {
        return $this->blockedUsers;
    }

    public function addBlockedUser(UserBlock $userBlock): self
    {
        if (!$this->blockedUsers->contains($userBlock)) {
            $this->blockedUsers->add($userBlock);
            $userBlock->setBlocker($this);
        }

        return $this;
    }

    public function removeBlockedUser(UserBlock $userBlock): self
    {
        if ($this->blockedUsers->removeElement($userBlock)) {
            // set the owning side to null (unless already changed)
            if ($userBlock->getBlocker() === $this) {
                $userBlock->setBlocker(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, UserBlock>
     */
    public function getBlockerUsers(): Collection
    {
        return $this->blockerUsers;
    }

    public function addBlockerUser(UserBlock $userBlock): self
    {
        if (!$this->blockerUsers->contains($userBlock)) {
            $this->blockerUsers->add($userBlock);
            $userBlock->setBlocked($this);
        }

        return $this;
    }

    public function removeBlockerUser(UserBlock $userBlock): self
    {
        if ($this->blockerUsers->removeElement($userBlock)) {
            // set the owning side to null (unless already changed)
            if ($userBlock->getBlocked() === $this) {
                $userBlock->setBlocked(null);
            }
        }

        return $this;
    }
}
