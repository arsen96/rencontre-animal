import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Animal } from '../interfaces/animal.interface';

export interface AnimalAffinity {
  animal: Animal;
  percent: number;
  sharedTraits: string[];
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class AffinityService {
  constructor(private readonly translate: TranslateService) {}

  getAffinities(source: Animal, catalog: Animal[], limit = 12): AnimalAffinity[] {
    const sourceTokens = this.tokensFor(source);
    const results: AnimalAffinity[] = [];

    for (const animal of catalog) {
      if (animal.id === source.id) {
        continue;
      }
      const otherTokens = this.tokensFor(animal);
      const shared = [...sourceTokens].filter((t) => otherTokens.has(t));
      const unionSize = new Set([...sourceTokens, ...otherTokens]).size || 1;
      const jaccard = shared.length / unionSize;
      const percent = Math.round(35 + jaccard * 65);

      const sharedTraits = this.sharedTraitLabels(source, animal);
      results.push({
        animal,
        percent: Math.min(98, Math.max(40, percent)),
        sharedTraits,
        reason: this.buildReason(source.name, animal.name, sharedTraits),
      });
    }

    return results.sort((a, b) => b.percent - a.percent || a.animal.name.localeCompare(b.animal.name)).slice(0, limit);
  }

  affinityBetween(a: Animal, b: Animal): AnimalAffinity {
    const list = this.getAffinities(a, [b], 1);
    return (
      list[0] ?? {
        animal: b,
        percent: 50,
        sharedTraits: [],
        reason: this.buildReason(a.name, b.name, []),
      }
    );
  }

  private tokensFor(animal: Animal): Set<string> {
    const raw = [
      ...animal.traits,
      ...animal.personality.split(/[,·•|/]+/),
    ];
    return new Set(raw.map((t) => this.normalize(t)).filter(Boolean));
  }

  private sharedTraitLabels(a: Animal, b: Animal): string[] {
    const bNorm = new Set(b.traits.map((t) => this.normalize(t)));
    return a.traits.filter((t) => bNorm.has(this.normalize(t))).slice(0, 3);
  }

  private buildReason(sourceName: string, otherName: string, shared: string[]): string {
    if (shared.length > 0) {
      return this.translate.instant('explore.reasonShared', {
        source: sourceName,
        other: otherName,
        traits: shared.join(' · '),
      });
    }
    return this.translate.instant('explore.reasonGeneric', {
      source: sourceName,
      other: otherName,
    });
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
