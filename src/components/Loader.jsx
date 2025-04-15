import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center">
      <Loader2 className="animate-spin w-8 h-8 text-Black" />
    </div>
  );
};

export default Loader;
