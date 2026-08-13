import { forwardRef, type CSSProperties, type ImgHTMLAttributes } from "react";

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  src: string;
  alt?: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  unoptimized?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  style?: CSSProperties;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  props,
  ref,
) {
  const {
    src,
    alt,
    width,
    height,
    fill,
    priority,
    quality,
    sizes,
    unoptimized,
    placeholder,
    blurDataURL,
    style,
    className,
    ...rest
  } = props;
  void quality;
  void unoptimized;
  void placeholder;
  void blurDataURL;

  const imgStyle: CSSProperties = fill
    ? {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
        ...style,
      }
    : { ...style };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt ?? ""}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      className={className}
      style={imgStyle}
      loading={priority ? "eager" : "lazy"}
      {...rest}
    />
  );
});

export default Image;