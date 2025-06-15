
import React from 'react';
import * as THREE from 'three';
import { MaleAvatarBody } from './MaleAvatarBody';
import { MaleAvatarClothing } from './MaleAvatarClothing';
import { MaleAvatarHeadBase } from './MaleAvatarHeadBase';
import { MaleAvatarEyes } from './MaleAvatarEyes';
import { MaleAvatarMouth } from './MaleAvatarMouth';
import { MaleAvatarNose } from './MaleAvatarNose';

interface MaleGeometryProps {
  headColor: string;
  eyeLeftRef: React.RefObject<THREE.Mesh>;
  eyeRightRef: React.RefObject<THREE.Mesh>;
  mouthRef: React.RefObject<THREE.Mesh>;
  emotion: 'neutral' | 'happy' | 'thinking';
}

export const MaleAvatarBodyWrapper: React.FC = () => {
  return (
    <>
      <MaleAvatarBody />
      <MaleAvatarClothing />
    </>
  );
};

export const MaleAvatarHead: React.FC<MaleGeometryProps> = ({ 
  headColor, 
  eyeLeftRef, 
  eyeRightRef, 
  mouthRef,
  emotion 
}) => {
  return (
    <>
      <MaleAvatarHeadBase emotion={emotion} />
      <MaleAvatarEyes 
        eyeLeftRef={eyeLeftRef}
        eyeRightRef={eyeRightRef}
        emotion={emotion}
      />
      <MaleAvatarMouth 
        mouthRef={mouthRef}
        emotion={emotion}
      />
      <MaleAvatarNose emotion={emotion} />
    </>
  );
};
