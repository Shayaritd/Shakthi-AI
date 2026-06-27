import { Sparkles } from 'lucide-react';

export function ShakthiLogo({ size = 'md', light = false }: { size?: 'sm' | 'md' | 'lg'; light?: boolean }) {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-3xl' };
  const iconSizes = { sm: 18, md: 22, lg: 32 };
  return (
    <div className={`flex items-center gap-1.5 font-poppins font-bold ${sizes[size]} ${light ? 'text-white' : 'text-[#1a7a6e]'}`}>
      <Sparkles size={iconSizes[size]} className={light ? 'text-white' : 'text-[#1a7a6e]'} />
      <span>SHAKTHI</span>
    </div>
  );
}
