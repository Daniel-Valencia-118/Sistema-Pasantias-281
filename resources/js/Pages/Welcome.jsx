import React from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/Components/Layout/PublicLayout';
import HeroSection from '@/Components/Home/HeroSection';
import MissionSection from '@/Components/Home/MissionSection';
import VisionSection from '@/Components/Home/VisionSection';
import AboutSection from '@/Components/Home/AboutSection';
import NosotrosContainer from '@/Components/Home/NosotrosContainer';

export default function Welcome() {
  return (
    <>
      <Head title="Inicio" />
      <PublicLayout>
        <HeroSection />
        <NosotrosContainer />
        <AboutSection />
      </PublicLayout>
    </>
  );
}