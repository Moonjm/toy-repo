const ICO_PREFIX = 'ico:';

type CategoryIconProps = {
  emoji: string;
  className?: string;
};

export default function CategoryIcon({ emoji, className = '' }: CategoryIconProps) {
  if (emoji.startsWith(ICO_PREFIX)) {
    const fileName = emoji.slice(ICO_PREFIX.length);
    return (
      <img
        src={`/icons/${fileName}.svg`}
        alt={fileName}
        className={`inline-block ${className}`}
        style={{ width: '1em', height: '1em' }}
      />
    );
  }

  return <span className={className}>{emoji}</span>;
}
