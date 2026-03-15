const ICO_PREFIX = 'ico:';

type CategoryIconProps = {
  emoji: string;
  className?: string;
};

export function isCustomIcon(emoji: string): boolean {
  return emoji.startsWith(ICO_PREFIX);
}

export default function CategoryIcon({ emoji, className = '' }: CategoryIconProps) {
  if (isCustomIcon(emoji)) {
    const fileName = emoji.slice(ICO_PREFIX.length);
    if (fileName.includes('/') || fileName.includes('..')) {
      return <span className={className}>?</span>;
    }
    return (
      <img
        src={`/icons/${fileName}.svg`}
        alt={fileName}
        className={`inline-block ${className}`}
        style={{ width: '1em', height: '1em' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return <span className={className}>{emoji}</span>;
}
