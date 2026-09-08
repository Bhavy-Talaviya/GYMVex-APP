import React from 'react';
import {
  Image as RNImage,
  ImageProps as RNImageProps,
  ImageResizeMode,
  StyleProp,
  ImageStyle,
} from 'react-native';

export interface AppImageProps extends Omit<RNImageProps, 'source'> {
  source: any;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' | string;
  contentPosition?: string;
  transition?: number;
  priority?: 'low' | 'normal' | 'high' | string;
  cachePolicy?: string;
  style?: StyleProp<ImageStyle>;
}

export const Image = React.forwardRef<RNImage, AppImageProps>((props, ref) => {
  const {
    contentFit = 'cover',
    contentPosition,
    transition,
    priority,
    cachePolicy,
    style,
    resizeMode: explicitResizeMode,
    ...rest
  } = props;

  let resizeMode: ImageResizeMode = 'cover';
  if (explicitResizeMode) {
    resizeMode = explicitResizeMode;
  } else if (contentFit === 'contain') {
    resizeMode = 'contain';
  } else if (contentFit === 'fill') {
    resizeMode = 'stretch';
  } else if (contentFit === 'none' || contentFit === 'scale-down') {
    resizeMode = 'center';
  }

  return (
    <RNImage
      ref={ref}
      resizeMode={resizeMode}
      style={[{ resizeMode }, style]}
      {...rest}
    />
  );
});

export default Image;
