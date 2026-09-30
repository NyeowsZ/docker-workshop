<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IdentificationQuestion extends Model
{
    use HasFactory;

    protected $table = 'identification_questions';

    protected $fillable = [
        'question',
        'answer',
        'acceptable_answers',
        'category',
        'hint',
        'explanation'
    ];

    /**
     * Checks if a user's answer matches the canonical answer or any accepted variants.
     */
    public function checkAnswer(string $userAnswer): bool
    {
        $normalizedUser = strtolower(trim($userAnswer));
        $normalizedCanonical = strtolower(trim($this->answer));

        if ($normalizedUser === $normalizedCanonical) {
            return true;
        }

        // Check comma or newline separated acceptable variants
        if (!empty($this->acceptable_answers)) {
            $variants = preg_split('/[,;\n]+/', $this->acceptable_answers);
            foreach ($variants as $variant) {
                if (strtolower(trim($variant)) === $normalizedUser) {
                    return true;
                }
            }
        }

        return false;
    }
}
