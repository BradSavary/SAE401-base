<?php

namespace App\Service;

use App\Entity\Hashtag;
use App\Entity\Mention;
use App\Entity\Post;
use App\Entity\User;
use App\Repository\HashtagRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

class HashtagMentionService
{
    private EntityManagerInterface $entityManager;
    private HashtagRepository $hashtagRepository;
    private UserRepository $userRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        HashtagRepository $hashtagRepository,
        UserRepository $userRepository
    ) {
        $this->entityManager = $entityManager;
        $this->hashtagRepository = $hashtagRepository;
        $this->userRepository = $userRepository;
    }

    /**
     * Analyse un message et extrait les hashtags et mentions
     * 
     * @param Post $post Le post à analyser
     */
    public function processHashtagsAndMentions(Post $post): void
    {
        $content = $post->getContent();
        
        // Traitement des hashtags
        $this->processHashtags($content, $post);
        
        // Traitement des mentions
        $this->processMentions($content, $post);
    }

    /**
     * Extrait et traite les hashtags d'un texte
     */
    private function processHashtags(string $content, Post $post): void
    {
        // Nettoyer les anciens hashtags (lors d'une mise à jour)
        foreach ($post->getHashtags() as $hashtag) {
            $post->removeHashtag($hashtag);
        }
        
        // Regex pour trouver les hashtags (un mot commençant par #)
        preg_match_all('/#([a-zA-Z0-9_]+)/', $content, $matches);
        
        if (empty($matches[1])) {
            return;
        }
        
        foreach ($matches[1] as $tagName) {
            // Normaliser (convertir en minuscules)
            $tagName = strtolower($tagName);
            
            // Vérifier si le hashtag existe déjà
            $hashtag = $this->hashtagRepository->findByName($tagName);
            
            // Si non, créer un nouveau hashtag
            if (!$hashtag) {
                $hashtag = new Hashtag();
                $hashtag->setName($tagName);
                $this->entityManager->persist($hashtag);
            }
            
            // Associer le hashtag au post
            $post->addHashtag($hashtag);
        }
    }

    /**
     * Extrait et traite les mentions d'un texte
     */
    private function processMentions(string $content, Post $post): void
    {
        // Supprimer les anciennes mentions (lors d'une mise à jour)
        foreach ($post->getMentions() as $mention) {
            $this->entityManager->remove($mention);
        }
        $this->entityManager->flush();
        
        // Regex pour trouver les mentions (un mot commençant par @)
        preg_match_all('/@([a-zA-Z0-9_]+)/', $content, $matches);
        
        if (empty($matches[1])) {
            return;
        }
        
        foreach ($matches[1] as $username) {
            // Chercher l'utilisateur mentionné
            $user = $this->userRepository->findOneBy(['username' => $username]);
            
            if ($user) {
                // Créer une nouvelle mention
                $mention = new Mention();
                $mention->setPost($post);
                $mention->setMentionedUser($user);
                
                $this->entityManager->persist($mention);
                $post->addMention($mention);
            }
        }
    }

    /**
     * Formate le texte pour remplacer les hashtags et mentions par des liens HTML
     */
    public function formatTextWithLinks(string $text): string
    {
        // Remplacer les hashtags par des liens
        $text = preg_replace(
            '/#([a-zA-Z0-9_]+)/',
            '<a href="/search?q=%23$1" class="hashtag">#$1</a>',
            $text
        );
        
        // Remplacer les mentions par des liens
        $text = preg_replace(
            '/@([a-zA-Z0-9_]+)/',
            '<a href="/profile/$1" class="mention">@$1</a>',
            $text
        );
        
        return $text;
    }
} 