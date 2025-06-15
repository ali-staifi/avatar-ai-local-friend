
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const InfoCards: React.FC = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6" aria-label="Informations sur les fonctionnalités">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">🎭 Personnalités Multiples</h3>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">🧠 Moteur de Discussion</h3>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">🔒 Confidentialité Totale</h3>
        </CardContent>
      </Card>
    </section>
  );
};
