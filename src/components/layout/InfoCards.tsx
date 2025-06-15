
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const InfoCards: React.FC = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6" aria-label="Informations sur les fonctionnalités">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">🎭 Personnalités Multiples</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• 6 personnalités distinctes</li>
            <li>• Styles de communication uniques</li>
            <li>• Réactions émotionnelles adaptées</li>
            <li>• Intérêts spécialisés par personnalité</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">🧠 Moteur de Discussion</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Mémoire conversationnelle contextuelle</li>
            <li>• Gestion intelligente des interruptions</li>
            <li>• Apprentissage des préférences utilisateur</li>
            <li>• Réponses adaptées au contexte</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">🔒 Confidentialité Totale</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Traitement 100% local</li>
            <li>• Aucune donnée envoyée en ligne</li>
            <li>• Mémoire stockée localement</li>
            <li>• Respect absolu de la vie privée</li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
};
