import { Text, View } from 'react-native';

import type { StatusEntry } from '@/constants/statusConfig';

interface StatusBadgeProps {
  status: StatusEntry;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <View
      className="self-start rounded-full px-3 py-1"
      style={{ backgroundColor: status.color }}>
      <Text className="font-body-medium text-body-sm text-white">{status.label}</Text>
    </View>
  );
}
