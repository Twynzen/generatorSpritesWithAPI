export interface SpritePromptTemplate {
  key: string;
  name: string;
  icon: string;
  description: string;
  prompt: string;
}

export const SPRITE_PROMPTS: SpritePromptTemplate[] = [
  {
    key: 'walk_cycle',
    name: 'Walk Cycle',
    icon: '🚶',
    description: 'Cyclic walking animation',
    prompt: `Character performs smooth walk cycle animation.
Legs stepping forward and back alternately, arms swinging naturally in opposition.
Feet stay planted on ground during contact, no floating or sliding.
Animation loops seamlessly, final frame matches starting pose exactly.
Static orthographic camera, no camera movement, centered composition.
Maintain consistent proportions, colors, and style throughout all frames.
Smooth motion, 24fps quality, game sprite aesthetic.`
  },
  {
    key: 'idle',
    name: 'Idle',
    icon: '🧍',
    description: 'Idle/breathing animation',
    prompt: `Character performs subtle idle breathing animation.
Chest rises and falls gently with natural breathing rhythm.
Slight shoulder movement, relaxed stance throughout.
Minimal weight shifting, very subtle motion.
Perfect for seamless looping background animation.
Static camera, no movement, maintain exact proportions.
Slow, smooth motion ideal for idle game state.`
  },
  {
    key: 'attack',
    name: 'Attack',
    icon: '⚔️',
    description: 'Attack animation',
    prompt: `Character performs attack swing animation.
Clear wind-up anticipation phase, powerful strike phase, smooth recovery.
Weapon or arm swings in controlled arc motion with weight and momentum.
Body follows through naturally with the motion then resets to starting pose.
Animation ends in exact starting position for seamless loop capability.
Static camera, dynamic action, maintain character proportions.
Sharp, impactful motion with clear keyframes.`
  },
  {
    key: 'run',
    name: 'Run Cycle',
    icon: '🏃',
    description: 'Running animation',
    prompt: `Character performs fast run cycle animation.
Legs pumping rapidly with proper running mechanics.
Arms swinging in opposition to legs with bent elbows.
Body leans slightly forward showing momentum and speed.
Dynamic motion while maintaining seamless loop.
Feet contact and push off ground naturally.
Static camera, energetic motion, consistent speed throughout.`
  },
  {
    key: 'jump',
    name: 'Jump',
    icon: '🦘',
    description: 'Jump animation',
    prompt: `Character performs jump animation.
Crouch anticipation, explosive upward motion, peak hang time, landing recovery.
Arms raise during jump, legs tuck at peak.
Returns to standing pose at end for loop capability.
Clear arc of motion with proper physics.
Static camera, vertical motion focus.
Smooth transitions between all phases.`
  },
  {
    key: 'death',
    name: 'Death/Fall',
    icon: '💀',
    description: 'Death animation',
    prompt: `Character performs death fall animation.
Dramatic reaction to impact, body goes limp.
Falls backward or forward with ragdoll physics.
Settles into final resting pose on ground.
One-shot animation, no loop needed.
Static camera, emotional impact, clear silhouette throughout.
Smooth motion preserving character recognition.`
  }
];
