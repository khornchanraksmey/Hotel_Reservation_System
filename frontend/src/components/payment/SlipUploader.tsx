import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage } from 'lucide-react';
import { validateSlipFile } from '../../utils/fileUtils';

interface Props {
  onFile: (file: File | null) => void;
}

export function SlipUploader({ onFile }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    const err = validateSlipFile(file);
    if (err) { setError(err); return; }
    setError(null);
    onFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  function clear() {
    setPreview(null);
    setError(null);
    onFile(null);
  }

  if (preview) {
    return (
      <div className="relative">
        <img src={preview} alt="Payment slip" className="w-full max-h-64 object-contain rounded-lg border border-gray-200" />
        <button
          onClick={clear}
          className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-gold bg-gold/5' : 'border-gray-300 hover:border-navy'
        }`}
      >
        <input {...getInputProps()} />
        <FileImage className="h-10 w-10 mx-auto text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? 'Drop your slip here...' : 'Drag & drop your payment slip here'}
        </p>
        <p className="text-xs text-gray-400 mt-1">or click to browse — JPG, PNG, PDF up to 10MB</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg text-sm">
          <Upload className="h-4 w-4" /> Choose File
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
