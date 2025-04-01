<?php

namespace App\Dto\Payload;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Constraints\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;

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

    #[Assert\File(
        maxSize: "5M",
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/mkv", "audio/mpeg", "audio/wav", "audio/mp3"],
        mimeTypesMessage: "Please upload a valid image or video file."
    )]
    private ?UploadedFile $media = null;

    public function getMedia(): ?UploadedFile
    {
        return $this->media;
    }

    public function setMedia(?UploadedFile $media): self
    {
        $this->media = $media;
        return $this;
    }
    
}