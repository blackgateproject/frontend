import { useState, useEffect } from "react";
import { Copy, EyeOff, Eye, Check } from "lucide-react";


{/* Password Field Component */}
const PasswordField = ({ value }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000); // Show checkmark for 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={showPassword ? value : '••••••••••••••••••••••••••••••••'}
        readOnly
        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded font-mono text-sm text-gray-700 cursor-default"
      />
      <button
        onClick={() => setShowPassword(!showPassword)}
        className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-700 border-none"
        title={showPassword ? "Hide" : "Show"}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
      <button
        onClick={copyToClipboard}
        className={`btn btn-sm border-none ${
          justCopied 
            ? 'bg-green-200 hover:bg-green-300 text-green-700' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}
        title={justCopied ? "Copied!" : "Copy"}
      >
        {justCopied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
};

export default PasswordField;