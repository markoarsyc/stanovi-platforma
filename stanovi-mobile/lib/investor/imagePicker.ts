import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

// Opens the media library and returns the picked image URIs (empty if cancelled
// or permission denied). `allowsMultiple` lets the user pick several at once.
export async function pickImages(allowsMultiple: boolean): Promise<string[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      'Dozvola odbijena',
      'Potreban je pristup galeriji da biste dodali slike.',
    );
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: allowsMultiple,
    quality: 0.8,
  });

  if (result.canceled) return [];
  return result.assets.map((asset) => asset.uri);
}
