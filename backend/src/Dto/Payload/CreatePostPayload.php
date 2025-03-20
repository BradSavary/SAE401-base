<?php

namespace App\Dto\Payload;

use Symfony\Component\Validator\Constraints as Assert;

class CreatePostPayload
{
    #[Assert\NotBlank]
    #[Assert\Length(max: 280)]
    private ?string $content = null;

    #[Assert\NotBlank]
    private ?int $user_id = null;

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(?string $content): self
    {
        $this->content = $content;
        return $this;
    }

    public function getUserId(): ?int
    {
        return $this->user_id;
    }

    public function setUserId(?int $user_id): self
    {
        $this->user_id = $user_id;
        return $this;
    }
    
}