export enum AnimationType {
  FADE_IN = 'fadeIn',
  FADE_OUT = 'fadeOut',
}

export type OnAnimationEndType = (animationType: AnimationType) => void;
