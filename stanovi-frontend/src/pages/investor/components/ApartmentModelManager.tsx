import { useEffect, useState, useCallback } from 'react';
import { Box, Trash2, AlertCircle } from 'lucide-react';
import { Model3DUpload } from './Model3DUpload';
import { Model3DViewer } from '@/pages/public/building-detail/Model3DViewer';
import { useInvestorApartmentModel } from '../hooks/useInvestorApartmentModel';
import type { ApartmentModel } from '@/shared/types/building-detail.types';

interface ApartmentModelManagerProps {
  apartmentId: string;
  onModelChangeSuccess?: () => void;
}

export function ApartmentModelManager({
  apartmentId,
  onModelChangeSuccess,
}: ApartmentModelManagerProps) {
  const [model, setModel] = useState<ApartmentModel | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const { modelLoading, modelError, uploadApartmentModel, deleteApartmentModel, getApartmentModel } =
    useInvestorApartmentModel();

  const loadModel = useCallback(async () => {
    setLocalLoading(true);
    try {
      const fetched = await getApartmentModel(apartmentId);
      setModel(fetched);
    } finally {
      setLocalLoading(false);
    }
  }, [apartmentId, getApartmentModel]);

  useEffect(() => {
    loadModel();
  }, [apartmentId, loadModel]);

  const handleUpload = async (file: File) => {
    const success = await uploadApartmentModel(apartmentId, file);
    if (success) {
      await loadModel();
      onModelChangeSuccess?.();
    }
  };

  const handleDelete = async () => {
    if (confirm('Da li ste sigurni da želite da obrišete 3D model?')) {
      const success = await deleteApartmentModel(apartmentId);
      if (success) {
        setModel(null);
        onModelChangeSuccess?.();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Box size={16} />
        <h4 className="font-display text-sm font-semibold text-foreground">3D model stana</h4>
      </div>

      <Model3DUpload onUploadSuccess={handleUpload} isLoading={modelLoading} />

      {modelError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-600">
          <AlertCircle size={16} />
          {modelError}
        </div>
      )}

      {localLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : model ? (
        <div className="space-y-2">
          <Model3DViewer src={model.modelUrl} />
          <button
            onClick={handleDelete}
            disabled={modelLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            <Trash2 size={16} />
            Obriši 3D model
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nema dodanog 3D modela za ovaj stan.</p>
      )}
    </div>
  );
}
