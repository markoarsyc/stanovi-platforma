import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

const MAX_MODEL_SIZE = 10 * 1024 * 1024;

export interface PickedModel {
  uri: string;
  name: string;
  size: number;
}

// Opens the file system and returns the picked .glb model (null if cancelled or
// invalid). Limits mirror the backend: .glb extension and 10MB.
export async function pickGlbModel(): Promise<PickedModel | null> {
  const result = await DocumentPicker.getDocumentAsync({
    // Android does not map .glb to a MIME type, so a MIME filter would hide the
    // very files we want. Filter by extension below instead.
    type: '*/*',
    multiple: false,
    // Without this the Android content:// URI cannot be read by FormData.
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset) return null;

  if (!asset.name.toLowerCase().endsWith('.glb')) {
    Alert.alert('Neispravan fajl', 'Dozvoljeni su samo .glb fajlovi.');
    return null;
  }

  const size = asset.size ?? 0;
  if (size > MAX_MODEL_SIZE) {
    Alert.alert('Fajl je prevelik', 'Maksimalna veličina 3D modela je 10 MB.');
    return null;
  }

  return { uri: asset.uri, name: asset.name, size };
}
