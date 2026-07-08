import type { ComponentType } from "react";
import type { SceneProps } from "./types";
import { FoldingHomesScene } from "./folding-homes-scene";
import { ExpandableHomesScene } from "./expandable-homes-scene";
import { NatureCabinsScene } from "./nature-cabins-scene";
import { TheDomeScene } from "./the-dome-scene";
import { AppleCabinsScene } from "./apple-cabins-scene";
import { GlampingCapsulesScene } from "./glamping-capsules-scene";

export type { SceneProps } from "./types";

/** Product slug → cutaway scene component. */
export const scenes: Record<string, ComponentType<SceneProps>> = {
  "folding-homes": FoldingHomesScene,
  "expandable-homes": ExpandableHomesScene,
  "nature-cabins": NatureCabinsScene,
  "the-dome": TheDomeScene,
  "apple-cabins": AppleCabinsScene,
  "glamping-capsules": GlampingCapsulesScene,
};

/** Resolve a scene for a slug, falling back to the folding home. */
export function getScene(slug: string): ComponentType<SceneProps> {
  return scenes[slug] ?? FoldingHomesScene;
}
