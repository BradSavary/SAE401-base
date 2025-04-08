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

    /**
     * @var UploadedFile[]
     */
    #[Assert\All([
        new Assert\File(
            maxSize: "50M",
            mimeTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/mkv", "audio/mpeg", "audio/wav", "audio/mp3"],
            mimeTypesMessage: "Please upload a valid image, video or audio file.",
            maxSizeMessage: "The file is too large. Maximum size is 50MB."
        )
    ])]
    private array $media = [];

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

    /**
     * @return UploadedFile[]
     */
    public function getMedia(): array
    {
        return $this->media;
    }

    /**
     * @param UploadedFile[] $media
     */
    public function setMedia(array $media): self
    {
        $this->media = $media;
        return $this;
    }
}