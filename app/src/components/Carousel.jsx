import React from 'react';
import { FlatList, View, Dimensions } from 'react-native';

interface CarouselProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}

const { width } = Dimensions.get('window');

export default function Carousel({ items, renderItem }: CarouselProps) {
  return (
    <FlatList
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      data={items}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item, index }) => (
        <View style={{ width, alignItems: 'center' }}>
          {renderItem(item, index)}
        </View>
      )}
    />
  );
}
